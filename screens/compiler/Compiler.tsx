import React, { useRef, useEffect, useState, useImperativeHandle, forwardRef } from 'react';
import Editor, { Monaco } from '@monaco-editor/react';
import { genSparkCompilerService } from '../../services/compilerService';

export interface CompilerRef {
    runCode: () => Promise<void>;
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
    const [code, setCode] = useState(initialCode);
    const editorRef = useRef<any>(null);
    const monacoRef = useRef<Monaco | null>(null);

    useEffect(() => {
        setCode(initialCode);
    }, [initialCode]);

    // Expose methods to parent
    useImperativeHandle(ref, () => ({
        runCode,
        getCode: () => code,
        insertText: (text: string) => {
            if (editorRef.current) {
                const selection = editorRef.current.getSelection();
                const range = new (monacoRef.current as any).Range(
                    selection.startLineNumber,
                    selection.startColumn,
                    selection.endLineNumber,
                    selection.endColumn
                );
                editorRef.current.executeEdits('custom-insert', [
                    { range, text, forceMoveMarkers: true }
                ]);
            }
        },
        deleteLastChar: () => {
            if (editorRef.current) {
                const selection = editorRef.current.getSelection();
                if (selection.isEmpty()) {
                    const range = new (monacoRef.current as any).Range(
                        selection.startLineNumber,
                        selection.startColumn - 1,
                        selection.startLineNumber,
                        selection.startColumn
                    );
                    editorRef.current.executeEdits('custom-delete', [{ range, text: '' }]);
                } else {
                    editorRef.current.executeEdits('custom-delete', [{ range: selection, text: '' }]);
                }
            }
        }
    }));

    const runCode = async () => {
        try {
            const result = await genSparkCompilerService.executeCode(language, code);
            onRun({
                ...result,
                accepted: result.status.id === 3,
                code,
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
    };

    return (
        <div className="w-full h-full min-h-[400px]">
            <Editor
                height="100%"
                language={language === 'c' || language === 'cpp' ? 'cpp' : language}
                value={code}
                onChange={(val) => {
                    const newCode = val || '';
                    setCode(newCode);
                    onCodeChange?.(newCode);
                }}
                onMount={handleEditorDidMount}
                theme="genspark-theme"
                options={{
                    fontSize: 14,
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                    readOnly,
                    lineNumbers: 'on',
                    roundedSelection: false,
                    cursorStyle: 'line',
                    automaticLayout: true,
                    fontFamily: "'Fira Code', 'Monaco', 'Menlo', monospace",

                    // STRICT LEARNING: Disable all IntelliSense
                    quickSuggestions: false,
                    suggestOnTriggerCharacters: false,
                    parameterHints: { enabled: false },
                    snippetSuggestions: 'none',
                    tabCompletion: 'off',
                    wordBasedSuggestions: 'off',
                    contextmenu: false, // Disabling right-click context menu

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
