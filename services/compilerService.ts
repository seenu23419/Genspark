import { supabaseDB } from './supabaseService';

// Piston Language Mapping
export const LANGUAGE_MAPPING: Record<string, string> = {
    'c': 'c',
    'cpp': 'cpp',
    'c++': 'cpp',
    'java': 'java',
    'python': 'python3',
    'javascript': 'javascript',
    'sql': 'sqlite3'
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

class GenSparkCompilerService {
    private pistonBaseUrl = 'https://emkc.org/api/v2/piston/execute';

    async executeCode(language: string, sourceCode: string, userId?: string, stdin: string = ""): Promise<ExecutionResult> {
        const langKey = language.toLowerCase();
        const pistonLang = LANGUAGE_MAPPING[langKey];

        if (!pistonLang) {
            return {
                stdout: null,
                stderr: `Language "${language}" is not supported by the Piston compiler.`,
                compile_output: null,
                message: 'Unsupported Language',
                time: null,
                memory: null,
                status: { id: 13, description: 'Internal Error' }
            };
        }

        try {
            console.log(`[Compiler] Using Piston API for ${language}`);

            const response = await fetch(this.pistonBaseUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    language: pistonLang,
                    version: "*",
                    files: [
                        {
                            content: sourceCode
                        }
                    ],
                    stdin: stdin
                })
            });

            if (!response.ok) {
                throw new Error(`Piston API returned error: ${response.statusText}`);
            }

            const data = await response.json();
            const { run, compile } = data;

            const result: ExecutionResult = {
                stdout: run.stdout || null,
                stderr: run.stderr || null,
                compile_output: compile?.stderr || compile?.stdout || null,
                message: run.signal ? `Signal: ${run.signal}` : null,
                time: null,
                memory: null,
                status: {
                    id: run.code === 0 ? 3 : 4, // 3: Accepted, 4: Runtime Error
                    description: run.code === 0 ? 'Accepted' : (run.signal ? `Terminated (${run.signal})` : 'Runtime Error')
                }
            };

            // Silent Error Logging
            if (result.stderr || result.compile_output) {
                this.logError(language, sourceCode, result).catch(() => { });
            }

            // Log execution for tracking
            if (userId) {
                await this.logExecution(userId);
            }

            return result;
        } catch (e: any) {
            console.error(`[Compiler] Piston execution failed:`, e.message);
            return {
                stdout: null,
                stderr: 'Compiler is currently busy or unreachable. Please try again later.',
                compile_output: null,
                message: 'Execution System Error',
                time: null,
                memory: null,
                status: { id: 13, description: 'Internal Error' }
            };
        }
    }

    private async logExecution(userId: string): Promise<void> {
        try {
            await supabaseDB.supabase
                .from('compiler_executions')
                .insert({
                    user_id: userId,
                    created_at: new Date().toISOString()
                });
        } catch (error) {
            console.error('Error logging execution:', error);
        }
    }

    private async logError(language: string, sourceCode: string, result: ExecutionResult) {
        try {
            const { data: { user } } = await supabaseDB.supabase.auth.getUser();
            if (!user) return;

            const errorType = result.compile_output ? 'SyntaxError' : 'RuntimeError';
            const rawMessage = (result.stderr || result.compile_output || result.message || 'Unknown Error').substring(0, 1000);

            await supabaseDB.supabase.from('error_logs').insert({
                user_id: user.id,
                language_id: language,
                error_type: errorType,
                raw_message: rawMessage,
                code_snapshot: sourceCode
            });
        } catch (e) {
            // Ignore logging errors
        }
    }

    async runTests(language: string, sourceCode: string, tests: { stdin?: string; expectedOutput: string }[], userId?: string): Promise<Array<{ passed: boolean; stdout?: string | null; stderr?: string | null; expected?: string; actual?: string }>> {
        const results: Array<{ passed: boolean; stdout?: string | null; stderr?: string | null; expected?: string; actual?: string }> = [];
        for (const t of tests) {
            try {
                const res = await this.executeCode(language, sourceCode, userId, t.stdin);

                // Normalize outputs for comparison
                const normalizeOutput = (str: string) => {
                    return str
                        .replace(/\r\n/g, '\n')  // Normalize line endings
                        .replace(/\r/g, '\n')     // Handle old Mac line endings
                        .trim()                   // Remove leading/trailing whitespace
                        .replace(/\s+$/gm, '')    // Remove trailing whitespace from each line
                        .replace(/\n+/g, '\n');   // Normalize multiple newlines
                };

                const actualOutput = normalizeOutput(res.stdout || '');
                const expectedOutput = normalizeOutput(t.expectedOutput || '');
                const passed = actualOutput === expectedOutput;

                // Log for debugging
                if (!passed) {
                    console.log('[Test Failed]', {
                        expected: expectedOutput,
                        actual: actualOutput,
                        stdin: t.stdin
                    });
                }

                results.push({
                    passed,
                    stdout: res.stdout,
                    stderr: res.stderr || res.compile_output,
                    expected: expectedOutput,
                    actual: actualOutput
                });
            } catch (e: any) {
                results.push({
                    passed: false,
                    stdout: null,
                    stderr: e?.message || 'Execution error',
                    expected: t.expectedOutput,
                    actual: null
                });
            }
        }
        return results;
    }

    getTemplate(lang: string): string {
        switch (lang.toLowerCase()) {
            case 'c':
                return `#include <stdio.h>

int main() {
    printf("Hello from GenSpark C IDE!\\n");
    return 0;
}`;
            case 'java':
                return `public class Main {
    public static void main(String[] args) {
        System.out.println("Hello from GenSpark Java IDE!");
    }
}`;
            case 'python':
                return `print("Hello from GenSpark Python IDE!")

# Try some numbers
for i in range(5):
    print(f"Number: {i}")`;
            case 'cpp':
                return `#include <iostream>

int main() {
    std::cout << "Hello from GenSpark C++ IDE!" << std::endl;
    return 0;
}`;
            case 'javascript':
                return `console.log("Hello from GenSpark JavaScript IDE!");`;
            case 'sql':
                return `-- Example SQL\nCREATE TABLE users (id INTEGER PRIMARY KEY, name TEXT);\nINSERT INTO users (name) VALUES ('GenSpark');\nSELECT * FROM users;`;
            default:
                return `// Start coding in ${lang}...`;
        }
    }
}

export const genSparkCompilerService = new GenSparkCompilerService();
