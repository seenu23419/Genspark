import { supabaseDB } from './supabaseService';
import { TestCase } from './practiceService';

// Wandbox Language Mapping
export const WANDBOX_COMPILERS: Record<string, string> = {
    'c': 'gcc-head',
    'cpp': 'gcc-head',
    'c++': 'gcc-head',
    'java': 'openjdk-head',
    'python': 'cpython-head',
    'javascript': 'nodejs-head',
    'sql': 'sqlite-head' // Valid check needed, but keeping placeholder
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
    private wandboxUrl = 'https://wandbox.org/api/compile.json';

    async executeCode(language: string, sourceCode: string, userId?: string, stdin: string = ""): Promise<ExecutionResult> {
        const langKey = language.toLowerCase();
        const compiler = WANDBOX_COMPILERS[langKey];

        if (!compiler) {
            return {
                stdout: null,
                stderr: `Language "${language}" is not supported by the Wandbox compiler.`,
                compile_output: null,
                message: 'Unsupported Language',
                time: null,
                memory: null,
                status: { id: 13, description: 'Internal Error' }
            };
        }

        try {
            console.log(`[Compiler] Using Wandbox API for ${language} (${compiler})`);

            // Compiler options for C/C++ to output as expected
            let options = "";
            if (langKey === 'c') options = "-std=c11";
            if (langKey === 'cpp' || langKey === 'c++') options = "-std=c++17";

            const response = await fetch(this.wandboxUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    code: sourceCode,
                    compiler: compiler,
                    options: options,
                    stdin: stdin,
                    save: false
                })
            });

            if (!response.ok) {
                throw new Error(`Wandbox API returned error: ${response.statusText}`);
            }

            const data = await response.json();

            // Map Wandbox response to ExecutionResult
            // status: "0" is success in Wandbox
            const isSuccess = data.status === '0';

            // Combine program output and error
            // Wandbox separates compiler messages (compile_message) from runtime (program_message, program_error)

            const result: ExecutionResult = {
                stdout: data.program_output || null,
                stderr: data.program_error || null,
                compile_output: data.compiler_output || data.compiler_error || null,
                message: data.signal || null,
                time: null,
                memory: null,
                status: {
                    id: isSuccess ? 3 : 4,
                    description: isSuccess ? 'Executed' : 'Runtime Error'
                }
            };

            // Handle Compile Errors specifically
            if (data.compiler_error) {
                result.status = { id: 6, description: 'Compilation Error' };
            }

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
            console.error(`[Compiler] Wandbox execution failed:`, e.message);
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

    async runTests(
        language: string,
        sourceCode: string,
        tests: TestCase[],
        userId?: string
    ): Promise<{
        total: number;
        passed: number;
        failed: number;
        failedCases: number[];
        status: "PASSED" | "FAILED" | "PARTIAL";
        results: Array<{
            passed: boolean;
            stdout?: string | null;
            stderr?: string | null;
            expected?: string;
            actual?: string;
            isHidden?: boolean;
        }>
    }> {
        const results: any[] = [];
        let passedCount = 0;
        const failedIndices: number[] = [];

        const normalizeOutput = (str: string) =>
            (str || '').replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim();

        // Run ALL test cases in parallel for speed
        const settled = await Promise.allSettled(
            tests.map((t) => {
                const stdin = t.input || t.stdin || '';
                return this.executeCode(language, sourceCode, userId, stdin);
            })
        );

        settled.forEach((outcome, i) => {
            const t = tests[i];
            if (outcome.status === 'fulfilled') {
                const res = outcome.value;
                const actualOutput = normalizeOutput(res.stdout || '');
                const expectedOutput = normalizeOutput(t.expectedOutput || t.expected_output || '');
                const passed = actualOutput === expectedOutput && res.status.id === 3;

                if (passed) passedCount++;
                else failedIndices.push(i);

                results.push({
                    passed,
                    stdout: t.isHidden ? null : res.stdout,
                    stderr: res.stderr || res.compile_output,
                    expected: t.isHidden ? null : expectedOutput,
                    actual: t.isHidden ? null : actualOutput,
                    isHidden: t.isHidden || t.is_hidden
                });
            } else {
                failedIndices.push(i);
                results.push({
                    passed: false,
                    stdout: null,
                    stderr: outcome.reason?.message || 'Execution error',
                    expected: t.isHidden ? null : (t.expectedOutput || t.expected_output),
                    actual: null,
                    isHidden: t.isHidden || t.is_hidden
                });
            }
        });

        const total = tests.length;
        let status: "PASSED" | "FAILED" | "PARTIAL" = "FAILED";
        if (passedCount === total) status = "PASSED";
        else if (passedCount > 0) status = "PARTIAL";

        return {
            total,
            passed: passedCount,
            failed: total - passedCount,
            failedCases: failedIndices,
            status,
            results
        };
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
