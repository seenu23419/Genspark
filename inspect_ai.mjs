
import { GoogleGenAI } from './node_modules/@google/genai/dist/node/index.js';
try {
    const ai = new GoogleGenAI({ apiKey: 'dummy' });
    console.log('AI Submodules:', Object.keys(ai));
    console.log('Models Methods:', Object.keys(ai.models));
    if (ai.models.generateContentStream) {
        console.log('generateContentStream exists');
    }
} catch (e) {
    console.error('Error during inspection:', e);
}
