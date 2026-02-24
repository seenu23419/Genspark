import React, { useRef, useEffect, useState, useImperativeHandle, forwardRef } from 'react';
import Editor, { Monaco } from '@monaco-editor/react';
import { genSparkCompilerService } from '../../services/compilerService';

export interface CompilerRef {
    runCode: () => Promise<void>;
    runTests: (tests: any[]) => Promise<void>;
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

const Compiler = React.memo(forwardRef<CompilerRef, CompilerProps>(({
    onRun,
    initialCode = '',
    onCodeChange,
    readOnly = false,
    language = 'python'
}, ref) => {
    const editorRef = useRef<any>(null);
    const monacoRef = useRef<Monaco | null>(null);
    const [isDarkMode, setIsDarkMode] = useState(() => document.documentElement.classList.contains('dark'));

    // Synchronize theme state with global class
    useEffect(() => {
        const observer = new MutationObserver(() => {
            setIsDarkMode(document.documentElement.classList.contains('dark'));
        });
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
        return () => observer.disconnect();
    }, []);

    // Update Monaco theme whenever isDarkMode changes
    useEffect(() => {
        if (monacoRef.current) {
            monacoRef.current.editor.setTheme(isDarkMode ? 'genspark-dark' : 'vs');
        }
    }, [isDarkMode]);

    // Reset editor ONLY if content actually differs (Prevents cursor jumping)
    useEffect(() => {
        if (editorRef.current) {
            const currentVal = editorRef.current.getValue();
            // Normalize EOL to avoid false positives (CRLF vs LF)
            const normalizedInitial = initialCode.replace(/\r\n/g, '\n');
            const normalizedCurrent = currentVal.replace(/\r\n/g, '\n');

            if (normalizedInitial !== normalizedCurrent) {
                editorRef.current.setValue(initialCode);
            }
        }
    }, [initialCode]);

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
        runTests: async (tests: any[]) => {
            try {
                const currentCode = editorRef.current?.getValue() || '';
                const resultSummary = await genSparkCompilerService.runTests(language, currentCode, tests);

                onRun({
                    ...resultSummary,
                    code: currentCode,
                    language,
                    accepted: resultSummary.status === "PASSED",
                    stderr: resultSummary.stderr,
                    compile_output: resultSummary.compile_output,
                    status: {
                        id: resultSummary.status === "PASSED" ? 3 : 4,
                        description: resultSummary.status === "PASSED" ? 'Accepted' : 'Tests Failed'
                    },
                    testResults: resultSummary.results
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

    const handleEditorDidMount = (editor: any, monaco: Monaco) => {
        editorRef.current = editor;
        monacoRef.current = monaco;

        // Define custom dark theme
        monaco.editor.defineTheme('genspark-dark', {
            base: 'vs-dark',
            inherit: true,
            rules: [],
            colors: { 'editor.background': '#0a0b14' }
        });

        // Initial theme set
        monaco.editor.setTheme(isDarkMode ? 'genspark-dark' : 'vs');

        // BLOCK COPY/PASTE
        const blockPaste = (e: any) => {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            return false;
        };

        editor.onKeyDown((e: any) => {
            const isPaste = (e.ctrlKey || e.metaKey) && e.keyCode === 52;
            const isShiftInsert = e.shiftKey && e.keyCode === 45;
            if (isPaste || isShiftInsert) {
                e.preventDefault();
                e.stopPropagation();
            }
        });

        const editorDomNode = editor.getDomNode();
        if (editorDomNode) {
            editorDomNode.addEventListener('paste', blockPaste, true);
            editorDomNode.addEventListener('drop', blockPaste, true);
            const textArea = editorDomNode.querySelector('textarea');
            if (textArea) {
                textArea.addEventListener('paste', blockPaste, true);
            }
        }

        // Snippets
        if (language === 'c' || language === 'cpp') {
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
        }

        if (language === 'python') {
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
        }
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
                theme={isDarkMode ? 'genspark-dark' : 'vs'}
                options={{
                    fontSize: window.innerWidth < 768 ? 16 : 14,
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                    readOnly,
                    lineNumbers: window.innerWidth < 768 ? 'off' : 'on',
                    roundedSelection: false,
                    cursorStyle: 'line',
                    automaticLayout: true,
                    fontFamily: "'Consolas', 'Courier New', monospace",
                    fontLigatures: false,
                    letterSpacing: 0,
                    disableLayerHinting: true,
                    lineHeight: 1.6,
                    glyphMargin: false,
                    folding: false,
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
}));

export default Compiler;
