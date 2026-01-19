import { useState, useRef, useCallback } from 'react';

export type RuntimeStatus = 'idle' | 'loading' | 'running' | 'success' | 'error';

interface ExecutionResult {
    output: string;
    error?: string;
}

export function useCodeRunner() {
    const [status, setStatus] = useState<RuntimeStatus>('idle');
    const [statusMessage, setStatusMessage] = useState<string>('');
    const workerRef = useRef<Worker | null>(null);

    const runCode = useCallback((language: string, code: string): Promise<ExecutionResult> => {
        return new Promise((resolve, reject) => {
            setStatus('loading');
            setStatusMessage('Initializing...');

            // Terminate previous worker if exists
            if (workerRef.current) {
                workerRef.current.terminate();
            }

            let workerPath = '';
            // Use absolute paths with /public assumption or relative fallback
            const basePath = window.location.origin;

            switch (language.toLowerCase()) {
                case 'python':
                    workerPath = `${basePath}/workers/pythonWorker.js`;
                    break;
                case 'cpp':
                case 'c':
                    workerPath = `${basePath}/workers/cppWorker.js`;
                    break;
                case 'java':
                    workerPath = `${basePath}/workers/javaWorker.js`;
                    break;
                default:
                    reject(new Error(`Language ${language} not supported for client-side execution.`));
                    return;
            }

            console.log(`[CodeRunner] Spawning worker at: ${workerPath}`);
            const worker = new Worker(workerPath);
            workerRef.current = worker;

            worker.onmessage = (event) => {
                const { type, message, output, error } = event.data;

                if (type === 'status') {
                    setStatusMessage(message);
                } else if (type === 'success') {
                    setStatus('success');
                    setStatusMessage('');
                    resolve({ output });
                    worker.terminate();
                    workerRef.current = null;
                } else if (type === 'error') {
                    setStatus('error');
                    setStatusMessage('');
                    resolve({ output: '', error }); // Resolve with error to show it in output panel
                    worker.terminate();
                    workerRef.current = null;
                }
            };

            worker.onerror = (err) => {
                setStatus('error');
                setStatusMessage('');
                reject(err);
                worker.terminate();
                workerRef.current = null;
            };

            worker.postMessage({ code });
        });
    }, []);

    return { runCode, status, statusMessage };
}
