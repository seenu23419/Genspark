// CheerpJ usually runs in the main thread or a specific worker setup provided by LeaningTech.
// We will structure this to handle the messages as requested.

self.onmessage = async (event) => {
    const { code } = event.data;

    postMessage({ type: 'status', message: 'Downloading Runtime...' });

    // Simulate loading CheerpJ
    setTimeout(() => {
        postMessage({ type: 'status', message: 'Compiling Java...' });

        // Mock execution
        setTimeout(() => {
            postMessage({
                type: 'success',
                output: `[CHEERPJ MOCK]\nJava Environment Initialized.\n\nOutput:\nHello from Java!\n(Simulated Output for: ${code.substring(0, 20)}...)`
            });
        }, 1500);

    }, 2000);
};
