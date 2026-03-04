/**
 * Execution Service with Judge0 Self-Hosted + Piston Fallback
 * 
 * Usage:
 * - Set VITE_JUDGE0_URL in .env.local for self-hosted Judge0
 * - Falls back to Piston (public API, no auth) if Judge0 fails
 * - Falls back to RapidAPI Judge0 if Piston fails (requires VITE_RAPIDAPI_KEY)
 * 
 * Priority:
 * 1. Self-hosted Judge0 (free, if running locally)
 * 2. Piston public API (free, public)
 * 3. Judge0 via RapidAPI (requires key, per-call cost)
 */

import { supabaseDB } from './supabaseService';
import { GlintoAIService } from './geminiService';

// Judge0 Language IDs (Community Edition common mapping)
export const LANGUAGE_MAPPING: Record<string, number> = {
  'c': 50,           // C (GCC 9.2.0)
  'cpp': 54,         // C++ (GCC 9.2.0)
  'java': 62,        // Java (OpenJDK 13.0.1)
  'python': 71,      // Python (3.8.1)
  'javascript': 63,  // Node.js (12.14.0)
  'typescript': 74,  // TypeScript (3.7.4)
  'csharp': 51,      // C# (Mono 6.6.0.161)
  'go': 60,          // Go (1.13.5)
  'rust': 73,        // Rust (1.40.0)
  'swift': 83,       // Swift (5.2.3)
  'ruby': 72,        // Ruby (2.7.0)
  'php': 68,         // PHP (7.4.1)
  'sql': 82,         // SQLite (3.31.1)
  'kotlin': 78,      // Kotlin (1.3.70)
  'r': 80,           // R (4.0.0)
  'perl': 85,        // Perl (5.28.1)
};

// Piston Language Names (public instance common mapping)
const PISTON_LANGUAGE_MAPPING: Record<string, string> = {
  'c': 'c',
  'cpp': 'cpp',
  'java': 'java',
  'python': 'python3',
  'javascript': 'javascript',
  'typescript': 'typescript',
  'csharp': 'csharp',
  'go': 'go',
  'rust': 'rust',
  'swift': 'swift',
  'ruby': 'ruby',
  'php': 'php',
  'kotlin': 'kotlin',
  'perl': 'perl'
};

export interface ExecutionResult {
  stdout: string | null;
  stderr: string | null;
  compile_output: string | null;
  message: string | null;
  time: string | null;
  memory: number | null;
  status: { id: number; description: string };
}

const getEnv = (key: string): string => {
  if (typeof (import.meta as any).env !== 'undefined') {
    return (import.meta as any).env[key] || '';
  }
  if (typeof process !== 'undefined' && process.env) {
    return process.env[key] || '';
  }
  return '';
};

class ExecutionService {
  // Self-hosted Judge0 (no auth, free)
  private judge0SelfHostedUrl = getEnv('VITE_JUDGE0_URL') || 'http://localhost:2358';

  // RapidAPI Judge0 (requires key, per-call cost)
  private rapidApiKey = getEnv('VITE_RAPIDAPI_KEY') || 'PLACEHOLDER_RAPIDAPI_KEY';
  private judge0RapidApiUrl = 'https://judge0-ce.p.rapidapi.com';

  // Piston (free public API)
  private pistonUrl = 'https://emkc.org/api/v2/piston/execute';

  // Optimization: Cache and Circuit Breakers
  private runtimesCache: any[] | null = null;
  private lastRuntimesFetch: number = 0;
  private CIRCUIT_BREAKER_DURATION = 60000; // 1 minute
  private circuitBreakers: Record<string, number> = {};

  private isBroken(backend: string): boolean {
    const brokenUntil = this.circuitBreakers[backend];
    return brokenUntil ? Date.now() < brokenUntil : false;
  }

  private markBroken(backend: string) {
    console.warn(`[Execution] Circuit breaker triggered for ${backend}`);
    this.circuitBreakers[backend] = Date.now() + this.CIRCUIT_BREAKER_DURATION;
  }

  /**
   * Execute code with fallback chain:
   * 1. Self-hosted Judge0 (free, if running)
   * 2. Piston (free, public API)
   * 3. Judge0 RapidAPI (requires key, per-call cost)
   */
  async executeCode(language: string, sourceCode: string, userId?: string, stdin: string = ''): Promise<ExecutionResult> {
    const backendErrors: string[] = [];

    // 1. Try self-hosted Judge0
    if (!this.isBroken('judge0-local')) {
      try {
        console.log(`[Execution] Attempting self-hosted Judge0 for ${language}`);
        return await this.executeWithJudge0SelfHosted(language, sourceCode, stdin);
      } catch (e: any) {
        console.warn(`[Execution] Self-hosted Judge0 failed:`, e.message);
        backendErrors.push(`Local Judge0: ${e.message}`);
        this.markBroken('judge0-local');
      }
    }

    // 2. Try Piston public API
    if (!this.isBroken('piston') && PISTON_LANGUAGE_MAPPING[language.toLowerCase()]) {
      try {
        console.log(`[Execution] Falling back to Piston for ${language}`);
        return await this.executeWithPiston(language, sourceCode, stdin);
      } catch (e: any) {
        console.warn(`[Execution] Piston failed:`, e.message);
        backendErrors.push(`Piston API: ${e.message}`);
        this.markBroken('piston');
      }
    } else if (!PISTON_LANGUAGE_MAPPING[language.toLowerCase()]) {
      backendErrors.push(`Piston API: Language ${language} not supported by Piston.`);
    }

    // 3. Try Judge0 via RapidAPI
    const hasRapidKey = this.rapidApiKey && !this.rapidApiKey.includes('PLACEHOLDER_RAPIDAPI_KEY');
    if (!this.isBroken('judge0-rapid') && hasRapidKey && LANGUAGE_MAPPING[language.toLowerCase()]) {
      try {
        console.log(`[Execution] Falling back to RapidAPI for ${language}`);
        return await this.executeWithJudge0RapidApi(language, sourceCode, stdin);
      } catch (e: any) {
        console.warn(`[Execution] Judge0 RapidAPI failed:`, e.message);
        backendErrors.push(`RapidAPI Judge0: ${e.message}`);
        this.markBroken('judge0-rapid');
      }
    } else if (!hasRapidKey) {
      backendErrors.push(`RapidAPI Judge0: API key not configured.`);
    } else if (!LANGUAGE_MAPPING[language.toLowerCase()]) {
      backendErrors.push(`RapidAPI Judge0: Language ${language} not supported by Judge0.`);
    }

    // 4. Last Resort: AI Simulation
    try {
      console.log(`[Execution] All backends failed or skipped. Attempting AI Simulation for ${language}`);
      const aiResult = await GlintoAIService.executeCodeSimulated(language, sourceCode, stdin);
      return {
        stdout: aiResult.stdout,
        stderr: (aiResult.stderr || "") + `\n\n(Note: Cloud backends are currently unreachable. Errors: ${backendErrors.join('; ')})`,
        compile_output: null,
        message: "Simulated Execution",
        time: "0.001",
        memory: 0,
        status: aiResult.status
      };
    } catch (e: any) {
      console.error(`[Execution] AI Simulation failed:`, e.message);
      backendErrors.push(`AI Simulator: ${e.message}`);
    }

    throw new Error(`Execution failed. All backends unavailable.\nDetails: ${backendErrors.join('\n')}`);
  }

  /**
   * Execute code on self-hosted Judge0 (no authentication required)
   */
  private async executeWithJudge0SelfHosted(language: string, sourceCode: string, stdin: string): Promise<ExecutionResult> {
    const languageId = LANGUAGE_MAPPING[language.toLowerCase()];
    if (!languageId) {
      throw new Error(`Language ${language} not supported by Judge0`);
    }

    // Submit code with wait=true for faster sync response
    const submissionResponse = await fetch(`${this.judge0SelfHostedUrl}/submissions?base64_encoded=false&wait=true`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        language_id: languageId,
        source_code: sourceCode,
        stdin: stdin,
        memory_limit: 256000, // 256 MB
        time_limit: 5, // 5 seconds
        cpu_time_limit: 10
      })
    });

    let result = await submissionResponse.json();

    // If wait=true didn't finish it (e.g. long running), fallback to polling
    if (result && result.status && result.status.id <= 2) {
      const token = result.token;
      let attempts = 0;
      const maxAttempts = 30; // Reduce polling wait for "fast" execution

      while (attempts < maxAttempts) {
        const resultResponse = await fetch(`${this.judge0SelfHostedUrl}/submissions/${token}?base64_encoded=false`);
        if (!resultResponse.ok) {
          throw new Error(`Failed to fetch Judge0 result: ${resultResponse.statusText}`);
        }

        result = await resultResponse.json();

        // Status 1 = In Queue, 2 = Processing; anything else = done
        if (result.status.id > 2) {
          break;
        }

        await new Promise(resolve => setTimeout(resolve, 100));
        attempts++;
      }
    }

    if (!result || result.status.id <= 2) {
      throw new Error('Judge0 execution timeout or processing');
    }

    return {
      stdout: result.stdout || null,
      stderr: result.stderr || null,
      compile_output: result.compile_output || null,
      message: result.message || null,
      time: result.time || null,
      memory: result.memory || null,
      status: result.status
    };
  }

  /**
   * Execute code on Piston (free public API, no auth)
   */
  private async executeWithPiston(language: string, sourceCode: string, stdin: string): Promise<ExecutionResult> {
    const pistonLang = PISTON_LANGUAGE_MAPPING[language.toLowerCase()];
    if (!pistonLang) {
      throw new Error(`Language ${language} not supported by Piston`);
    }

    // Get version (from cache if possible)
    let runtimes = this.runtimesCache;
    const now = Date.now();

    if (!runtimes || (now - this.lastRuntimesFetch > 3600000)) { // 1 hour cache
      const versionsResponse = await fetch(`${this.pistonUrl.replace('/execute', '')}/runtimes`);
      if (versionsResponse.ok) {
        runtimes = await versionsResponse.json();
        this.runtimesCache = runtimes;
        this.lastRuntimesFetch = now;
      }
    }

    if (!runtimes) {
      throw new Error('Piston runtime list unavailable');
    }

    const runtime = runtimes.find((r: any) => r.language === pistonLang);
    if (!runtime) {
      throw new Error(`${pistonLang} runtime not available in Piston`);
    }

    const response = await fetch(this.pistonUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        language: pistonLang,
        version: runtime.version,
        files: [{ name: `main.${this.getFileExtension(language)}`, content: sourceCode }],
        stdin: stdin
      })
    });

    if (!response.ok) {
      const errorBody = await response.text().catch(() => 'No error body');
      console.error(`[Execution] Piston execution failed. Status: ${response.status}, Body: ${errorBody}`);
      throw new Error(`Piston execution failed: ${response.statusText}`);
    }

    const result = await response.json();

    return {
      stdout: result.run?.stdout || null,
      stderr: result.run?.stderr || null,
      compile_output: result.compile?.stderr || null,
      message: result.message || null,
      time: result.run?.signal ? null : (result.run?.wall_time ? result.run.wall_time.toString() : null),
      memory: null,
      status: {
        id: result.run?.code === 0 ? 3 : 5,
        description: result.run?.code === 0 ? 'Accepted' : 'Runtime Error'
      }
    };
  }

  /**
   * Execute code on Judge0 via RapidAPI (requires key, per-call cost)
   */
  private async executeWithJudge0RapidApi(language: string, sourceCode: string, stdin: string): Promise<ExecutionResult> {
    const languageId = LANGUAGE_MAPPING[language.toLowerCase()];
    if (!languageId) {
      throw new Error(`Language ${language} not supported by Judge0`);
    }

    // Submit code with wait=true for faster sync response
    const submissionResponse = await fetch(`${this.judge0RapidApiUrl}/submissions?base64_encoded=false&wait=true`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-RapidAPI-Key': this.rapidApiKey,
        'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com'
      },
      body: JSON.stringify({
        language_id: languageId,
        source_code: sourceCode,
        stdin: stdin
      })
    });

    if (!submissionResponse.ok) {
      throw new Error(`Judge0 RapidAPI submission failed: ${submissionResponse.statusText}`);
    }

    let result = await submissionResponse.json();

    // If wait=true didn't finish it (e.g. long running), fallback to polling
    if (result && result.status && result.status.id <= 2) {
      const token = result.token;
      let attempts = 0;
      const maxAttempts = 30; // Reduce polling wait for "fast" execution

      while (attempts < maxAttempts) {
        const resultResponse = await fetch(`${this.judge0RapidApiUrl}/submissions/${token}?base64_encoded=false`, {
          headers: {
            'X-RapidAPI-Key': this.rapidApiKey,
            'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com'
          }
        });

        if (!resultResponse.ok) {
          throw new Error(`Judge0 RapidAPI result fetch failed: ${resultResponse.statusText}`);
        }

        result = await resultResponse.json();

        if (result.status.id > 2) {
          break;
        }

        await new Promise(resolve => setTimeout(resolve, 100));
        attempts++;
      }
    }

    if (!result || result.status.id <= 2) {
      throw new Error('Judge0 RapidAPI execution timeout');
    }

    return {
      stdout: result.stdout || null,
      stderr: result.stderr || null,
      compile_output: result.compile_output || null,
      message: result.message || null,
      time: result.time || null,
      memory: result.memory || null,
      status: result.status
    };
  }

  /**
   * Get file extension for a given language
   */
  private getFileExtension(language: string): string {
    const ext: Record<string, string> = {
      'c': 'c', 'cpp': 'cpp', 'java': 'java', 'python': 'py',
      'javascript': 'js', 'typescript': 'ts', 'csharp': 'cs',
      'go': 'go', 'rust': 'rs', 'swift': 'swift', 'ruby': 'rb',
      'php': 'php', 'kotlin': 'kt', 'perl': 'pl'
    };
    return ext[language.toLowerCase()] || 'txt';
  }
}

export const executionService = new ExecutionService();

