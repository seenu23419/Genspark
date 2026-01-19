importScripts("https://cdn.jsdelivr.net/pyodide/v0.25.0/full/pyodide.js");

let pyodide = null;

async function loadPyodideEngine() {
    if (!pyodide) {
        postMessage({ type: 'status', message: 'Downloading Runtime...' });
        pyodide = await loadPyodide();
        postMessage({ type: 'status', message: 'Runtime Ready' });
    }
}

self.onmessage = async (event) => {
    const { code } = event.data;

    try {
        await loadPyodideEngine();

        // Redirect stdout
        let stdout = [];
        pyodide.setStdout({ batched: (msg) => stdout.push(msg) });

        await pyodide.runPythonAsync(code);

        postMessage({ type: 'success', output: stdout.join('\n') });
    } catch (error) {
        postMessage({ type: 'error', error: error.message });
    }
};
