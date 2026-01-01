
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

class GenSparkCompilerService {
    private rapidApiKey = (import.meta as any).env.VITE_RAPIDAPI_KEY || 'PLACEHOLDER_RAPIDAPI_KEY';
    private judge0BaseUrl = 'https://judge0-ce.p.rapidapi.com';
    private pistonBaseUrl = 'https://emkc.org/api/v2/piston/execute';

    async executeCode(language: string, sourceCode: string): Promise<ExecutionResult> {
        // Preference: If Judge0 key exists, use it. Otherwise use Piston.
        const hasJudge0 = this.rapidApiKey && this.rapidApiKey !== 'PLACEHOLDER_RAPIDAPI_KEY';

        if (hasJudge0) {
            try {
                return await this.executeWithJudge0(language, sourceCode);
            } catch (error) {
                console.warn('Judge0 failed, falling back to Piston:', error);
                return await this.executeWithPiston(language, sourceCode);
            }
        } else {
            return await this.executeWithPiston(language, sourceCode);
        }
    }

    private async executeWithJudge0(language: string, sourceCode: string): Promise<ExecutionResult> {
        const languageId = LANGUAGE_MAPPING[language.toLowerCase()];
        if (!languageId) {
            throw new Error(`Language ${language} is not supported by Judge0.`);
        }

        // 1. Create a submission
        const response = await fetch(`${this.judge0BaseUrl}/submissions?base64_encoded=true&wait=false`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-RapidAPI-Key': this.rapidApiKey,
                'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com'
            },
            body: JSON.stringify({
                language_id: languageId,
                source_code: btoa(sourceCode),
            })
        });

        if (!response.ok) {
            throw new Error(`Failed to create submission: ${response.statusText}`);
        }

        const { token } = await response.json();

        // 2. Poll for results
        return await this.pollForJudge0Result(token);
    }

    private async pollForJudge0Result(token: string): Promise<ExecutionResult> {
        const maxAttempts = 10;
        const interval = 1000;

        for (let i = 0; i < maxAttempts; i++) {
            const response = await fetch(`${this.judge0BaseUrl}/submissions/${token}?base64_encoded=true`, {
                headers: {
                    'X-RapidAPI-Key': this.rapidApiKey,
                    'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com'
                }
            });

            if (!response.ok) {
                throw new Error(`Failed to poll result: ${response.statusText}`);
            }

            const result = await response.json();
            const statusId = result.status.id;

            // Status 1: In Queue, Status 2: Processing
            if (statusId > 2) {
                return {
                    stdout: result.stdout ? atob(result.stdout) : null,
                    stderr: result.stderr ? atob(result.stderr) : null,
                    compile_output: result.compile_output ? atob(result.compile_output) : null,
                    message: result.message ? atob(result.message) : null,
                    time: result.time,
                    memory: result.memory,
                    status: result.status
                };
            }

            await new Promise(resolve => setTimeout(resolve, interval));
        }

        throw new Error('Timeout: Compilation taking too long.');
    }

    private async executeWithPiston(language: string, sourceCode: string): Promise<ExecutionResult> {
        const pistonLang = PISTON_LANGUAGE_MAPPING[language.toLowerCase()];
        if (!pistonLang) {
            throw new Error(`Language ${language} is not supported by the Piston API.`);
        }

        try {
            const response = await fetch(this.pistonBaseUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    language: pistonLang,
                    version: "*",
                    files: [{ content: sourceCode }]
                })
            });

            if (!response.ok) {
                throw new Error(`Piston API returned error: ${response.statusText}`);
            }

            const data = await response.json();
            const { run, compile } = data;

            // Map Piston response to ExecutionResult
            return {
                stdout: run.stdout || null,
                stderr: run.stderr || null,
                compile_output: compile?.stderr || compile?.stdout || null,
                message: run.signal ? `Signal: ${run.signal}` : null,
                time: null, // Piston doesn't always provide detailed time in same format
                memory: null,
                status: {
                    id: run.code === 0 ? 3 : 4, // 3 is Accepted, 4 is Runtime Error in Judge0 terms
                    description: run.code === 0 ? 'Accepted' : (run.signal ? `Terminated (${run.signal})` : 'Runtime Error')
                }
            };
        } catch (error) {
            console.error('Piston Error:', error);
            throw error;
        }
    }

    // Predefined templates for languages
    getTemplate(lang: string): string {
        switch (lang.toLowerCase()) {
            case 'c':
                return `#include <stdio.h>\n\nint main() {\n    printf("Hello from GenSpark C IDE!\\n");\n    return 0;\n}`;
            case 'java':
                return `public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello from GenSpark Java IDE!");\n    }\n}`;
            case 'python':
                return `print("Hello from GenSpark Python IDE!")\n\n# Try some numbers\nfor i in range(5):\n    print(f"Number: {i}")`;
            case 'cpp':
                return `#include <iostream>\n\nint main() {\n    std::cout << "Hello from GenSpark C++ IDE!" << std::endl;\n    return 0;\n}`;
            case 'csharp':
                return `using System;\n\nclass Program {\n    static void Main() {\n        Console.WriteLine("Hello from GenSpark C# IDE!");\n    }\n}`;
            case 'go':
                return `package main\nimport "fmt"\n\nfunc main() {\n    fmt.Println("Hello from GenSpark Go IDE!")\n}`;
            case 'rust':
                return `fn main() {\n    println!("Hello from GenSpark Rust IDE!");\n}`;
            case 'php':
                return `<?php\necho "Hello from GenSpark PHP IDE!";\n?>`;
            case 'ruby':
                return `puts "Hello from GenSpark Ruby IDE!"`;
            case 'sql':
                return `-- Example SQL\nCREATE TABLE users (id INTEGER PRIMARY KEY, name TEXT);\nINSERT INTO users (name) VALUES ('GenSpark');\nSELECT * FROM users;`;
            case 'typescript':
                return `const greeting: string = "Hello from GenSpark TypeScript IDE!";\nconsole.log(greeting);`;
            case 'swift':
                return `print("Hello from GenSpark Swift IDE!")`;
            case 'kotlin':
                return `fun main() {\n    println("Hello from GenSpark Kotlin IDE!")\n}`;
            default:
                return `// Start coding in ${lang}...`;
        }
    }
}

export const genSparkCompilerService = new GenSparkCompilerService();
