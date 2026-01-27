import React, { useRef, useEffect, useState, useImperativeHandle, forwardRef } from 'react';
import Editor, { Monaco } from '@monaco-editor/react';
import { genSparkCompilerService } from '../../services/compilerService';

export interface CompilerRef {
    runCode: () => Promise<void>;
    runTests: (tests: { stdin?: string; expected_output: string }[]) => Promise<void>;
    getCode: () => string;
    insertText: (text: string) => void;
    deleteLastChar: () => void;
}

interface CompilerProps {
    onRun: (result: any) => void;
    initialCode?: string;
    onCodeChange?: (code: string) => void;
    readOnly?: boolean;
    language?: string;
}

const Compiler = forwardRef<CompilerRef, CompilerProps>(({
    onRun,
    initialCode = '',
    onCodeChange,
    readOnly = false,
    language = 'python'
}, ref) => {
    const [currentInitialCode, setCurrentInitialCode] = useState(initialCode);
    const editorRef = useRef<any>(null);
    const monacoRef = useRef<Monaco | null>(null);

    // Reset editor ONLY if content actually differs (Prevents cursor jumping)
    useEffect(() => {
        if (editorRef.current) {
            const currentVal = editorRef.current.getValue();
            if (initialCode !== currentVal) {
                editorRef.current.setValue(initialCode);
            }
        }
    }, [initialCode]);

    // Expose methods to parent
    useImperativeHandle(ref, () => ({
        runCode,
        getCode: () => editorRef.current?.getValue() || '',
        insertText: (text: string) => {
            if (editorRef.current) {
                editorRef.current.focus();
                editorRef.current.trigger('keyboard', 'type', { text });
            }
        },
        deleteLastChar: () => {
            if (editorRef.current) {
                editorRef.current.focus();
                editorRef.current.trigger('keyboard', 'deleteLeft', {});
            }
        },
        runTests: async (tests: { stdin?: string; expected_output: string }[]) => {
            try {
                const currentCode = editorRef.current?.getValue() || '';
                const testSpecs = tests.map(t => ({ stdin: t.stdin, expectedOutput: t.expected_output }));
                const results = await genSparkCompilerService.runTests(language, currentCode, testSpecs);

                const allPassed = results.every(r => r.passed);
                const firstFail = results.find(r => !r.passed);

                // For the result UI, we show the first failing case or the last successful one
                const displayResult = firstFail || results[results.length - 1];

                onRun({
                    stdout: displayResult.stdout,
                    stderr: displayResult.stderr,
                    accepted: allPassed,
                    status: { id: allPassed ? 3 : 4, description: allPassed ? 'Accepted' : 'Tests Failed' },
                    code: currentCode,
                    language,
                    testResults: results // Pack for potential UI use
                });
            } catch (error: any) {
                onRun({
                    stdout: null,
                    stderr: error.message || 'Test system error',
                    accepted: false,
                    status: { id: 13, description: 'Internal Error' }
                });
            }
        }
    }));

    const runCode = async () => {
        try {
            const currentCode = editorRef.current?.getValue() || '';
            const result = await genSparkCompilerService.executeCode(language, currentCode);
            onRun({
                ...result,
                accepted: result.status.id === 3,
                code: currentCode,
                language
            });
        } catch (error: any) {
            onRun({
                stdout: null,
                stderr: error.message || 'Compiler error',
                accepted: false,
                status: { id: 13, description: 'Internal Error' }
            });
        }
    };

    const handleEditorDidMount = (editor: any, monaco: Monaco) => {
        editorRef.current = editor;
        monacoRef.current = monaco;

        // Define custom theme
        monaco.editor.defineTheme('genspark-theme', {
            base: 'vs-dark',
            inherit: true,
            rules: [],
            colors: {
                'editor.background': '#0a0b14',
            }
        });
        monaco.editor.setTheme('genspark-theme');

        // BLOCK COPY/PASTE
        const editorDomNode = editor.getDomNode();
        if (editorDomNode) {
            editorDomNode.addEventListener('copy', (e: any) => {
                e.preventDefault();
                alert('Copying is disabled in the learning environment.');
            }, true);

            editorDomNode.addEventListener('paste', (e: any) => {
                e.preventDefault();
                alert('Pasting code is disabled. Please type it yourself to learn!');
            }, true);

            editorDomNode.addEventListener('keydown', (e: any) => {
                if ((e.ctrlKey || e.metaKey) && (e.key === 'v' || e.key === 'V')) {
                    e.preventDefault();
                }
                if ((e.ctrlKey || e.metaKey) && (e.key === 'c' || e.key === 'C')) {
                    e.preventDefault();
                }
            }, true);
        }

        // REGISTER CUSTOM SNIPPETS FOR C (Aesthetics and utility like VS Code)
        monaco.languages.registerCompletionItemProvider('cpp', {
            provideCompletionItems: () => {
                const suggestions: any[] = [
                    {
                        label: 'printf',
                        kind: monaco.languages.CompletionItemKind.Function,
                        insertText: 'printf("${1:message}\\n");$0',
                        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                        detail: 'Standard C Output'
                    },
                    {
                        label: 'scanf',
                        kind: monaco.languages.CompletionItemKind.Function,
                        insertText: 'scanf("%${1:d}", &${2:var});$0',
                        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                        detail: 'Standard C Input'
                    },
                    {
                        label: 'int_main',
                        kind: monaco.languages.CompletionItemKind.Snippet,
                        insertText: 'int main() {\n\t${1:// TODO}\n\treturn 0;\n}$0',
                        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                        detail: 'Main Function Structure'
                    },
                    {
                        label: 'include',
                        kind: monaco.languages.CompletionItemKind.Snippet,
                        insertText: '#include <stdio.h>\n$0',
                        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                        detail: 'Standard IO Header'
                    }
                ];
                return { suggestions };
            }
        });

        // Add Python snippets too
        monaco.languages.registerCompletionItemProvider('python', {
            provideCompletionItems: () => {
                const suggestions: any[] = [
                    {
                        label: 'print',
                        kind: monaco.languages.CompletionItemKind.Function,
                        insertText: 'print("${1:hello}")$0',
                        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                        detail: 'Python Print'
                    },
                    {
                        label: 'def',
                        kind: monaco.languages.CompletionItemKind.Keyword,
                        insertText: 'def ${1:function_name}(${2:params}):\n\t${0:pass}',
                        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                        detail: 'Function Definition'
                    }
                ];
                return { suggestions };
            }
        });
    };

    return (
        <div className="w-full h-full min-h-0">
            <Editor
                height="100%"
                language={language === 'c' || language === 'cpp' ? 'cpp' : language}
                defaultValue={initialCode}
                onChange={(val) => {
                    onCodeChange?.(val || '');
                }}
                onMount={handleEditorDidMount}
                theme="genspark-theme"
                options={{
                    fontSize: window.innerWidth < 768 ? 16 : 14,
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                    readOnly,
                    lineNumbers: window.innerWidth < 768 ? 'off' : 'on',
                    roundedSelection: false,
                    cursorStyle: 'line',
                    automaticLayout: true,
                    fontFamily: "'Fira Code', 'Monaco', 'Menlo', monospace",
                    lineHeight: 1.6,
                    glyphMargin: false,
                    folding: false,

                    // INTELLISENSE: High-productivity features enabled
                    quickSuggestions: {
                        other: true,
                        comments: false,
                        strings: false
                    },
                    suggestOnTriggerCharacters: true,
                    parameterHints: { enabled: true },
                    snippetSuggestions: 'top',
                    tabCompletion: 'on',
                    wordBasedSuggestions: 'all',
                    contextmenu: true,

                    // Styling
                    scrollbar: {
                        vertical: 'visible',
                        horizontal: 'visible',
                        useShadows: false,
                        verticalScrollbarSize: 10,
                        horizontalScrollbarSize: 10,
                    }
                }}
            />
        </div>
    );
});

export default Compiler;
