import { supabaseDB } from './supabaseService';
import { TestCase } from './practiceService';
import { executionService } from './executionService';

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
    async executeCode(language: string, sourceCode: string, userId?: string, stdin: string = ""): Promise<ExecutionResult> {
        try {
            console.log(`[Compiler] Using ExecutionService for ${language}`);
            const result = await executionService.executeCode(language, sourceCode, userId, stdin);

            // Silent Error Logging
            if (result.stderr || result.compile_output) {
                this.logError(language, sourceCode, result).catch(() => { });
            }

            return result;
        } catch (e: any) {
            console.error(`[Compiler] Execution failed:`, e.message);
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
        stderr?: string | null;
        compile_output?: string | null;
        results: Array<{
            passed: boolean;
            stdout?: string | null;
            stderr?: string | null;
            expected?: string;
            actual?: string;
            isHidden?: boolean;
        }>
    }> {
        const results: any[] = new Array(tests.length);
        let passedCount = 0;
        const failedIndices: number[] = [];
        let aggregateStderr: string | null = null;
        let aggregateCompileOutput: string | null = null;

        const normalizeOutput = (str: string) =>
            (str || '').replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim();

        // CONCURRENCY CONTROL: Limit to 3 parallel requests
        const limit = 3;
        const queue = [...tests.entries()];

        const runWorker = async () => {
            while (queue.length > 0) {
                const item = queue.shift();
                if (!item) break;
                const [i, t] = item;
                const stdin = t.input || t.stdin || '';

                try {
                    const res = await this.executeCode(language, sourceCode, userId, stdin);
                    const actualOutput = normalizeOutput(res.stdout || '');
                    const expectedOutput = normalizeOutput(t.expectedOutput || t.expected_output || '');
                    const passed = actualOutput === expectedOutput && res.status.id === 3;

                    if (passed) passedCount++;
                    else {
                        failedIndices.push(i);
                        if (!aggregateStderr && res.stderr) aggregateStderr = res.stderr;
                        if (!aggregateCompileOutput && res.compile_output) aggregateCompileOutput = res.compile_output;
                    }

                    results[i] = {
                        passed,
                        stdout: t.isHidden ? null : res.stdout,
                        stderr: res.stderr || res.compile_output,
                        expected: t.isHidden ? null : expectedOutput,
                        actual: t.isHidden ? null : actualOutput,
                        isHidden: t.isHidden || t.is_hidden
                    };
                } catch (error: any) {
                    failedIndices.push(i);
                    const errorMsg = error.message || 'Execution error';
                    if (!aggregateStderr) aggregateStderr = errorMsg;
                    results[i] = {
                        passed: false,
                        stdout: null,
                        stderr: errorMsg,
                        expected: t.isHidden ? null : (t.expectedOutput || t.expected_output),
                        actual: null,
                        isHidden: t.isHidden || t.is_hidden
                    };
                }
            }
        };

        // Start workers
        await Promise.all(Array.from({ length: Math.min(limit, tests.length) }).map(runWorker));

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
            stderr: aggregateStderr,
            compile_output: aggregateCompileOutput,
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
