
export interface MediaPart {
  mimeType: string;
  data: string;
}

// Safely access environment variables
const getApiKey = (): string => {
  try {
    return (
      (typeof (import.meta as any).env !== 'undefined' ? (import.meta as any).env.VITE_GEMINI_API_KEY : '') ||
      (typeof process !== 'undefined' && process.env ? (process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || process.env.API_KEY) : '') ||
      ''
    );
  } catch {
    return '';
  }
};

export class GenSparkAIService {
  private apiKey: string = '';

  constructor() {
    this.apiKey = getApiKey();
  }

  async *generateChatStream(message: string, isPro: boolean = false, history: any[] = [], attachment?: MediaPart) {
    if (!this.apiKey) {
      this.apiKey = getApiKey();
    }

    if (!this.apiKey || this.apiKey === 'PLACEHOLDER_API_KEY') {
      yield "GenSpark AI: I'm currently in 'offline mode' because the Gemini API key is missing or invalid. Please add your API key to the .env.local file to activate me! 🚀";
      return;
    }

    // Diagnostic: Try to list models once to see what's available
    try {
      const diagUrl = `https://generativelanguage.googleapis.com/v1beta/models?key=${this.apiKey}`;
      const diagResp = await fetch(diagUrl);
      if (diagResp.ok) {
        const diagData = await diagResp.json();
        console.log("GenSpark AI: Available Models:", diagData.models?.map((m: any) => m.name));
      }
    } catch (e) { }

    // Based on diagnostic: gemini-2.0-flash-lite is available and might have less quota pressure.
    const models = ['gemini-2.0-flash-lite', 'gemini-2.0-flash', 'gemini-1.5-flash'];
    let lastError = '';

    const systemPrompt = `You are GenSpark AI, an intelligent and friendly coding companion. ${isPro ? "The user is a PRO member; provide expert-level depth." : ""}
              
    Guidelines:
    1. **Style**: ChatGPT-like formatting (markdown, headings, lists).
    2. **Tone**: Encouraging, enthusiastic. 
    3. **Emojis**: Use frequently! 🚀💡✅🐛.
    4. **Code**: Always use Markdown code blocks.
    5. **Visuals**: Analyze images thoroughly if provided.`;

    for (const modelName of models) {
      try {
        console.log(`GenSpark AI: Attempting with model ${modelName}...`);
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:streamGenerateContent?alt=sse&key=${this.apiKey}`;

        // Merge system prompt into first user message to avoid 'system' role compatibility issues
        const updatedHistory = [...history];
        if (updatedHistory.length === 0) {
          updatedHistory.push({
            role: 'user',
            parts: [{ text: `[SYSTEM INSTRUCTION: ${systemPrompt}]\n\nUser: ${message}` }]
          });
          if (attachment) {
            updatedHistory[0].parts.push({ inlineData: { mimeType: attachment.mimeType, data: attachment.data } });
          }
        } else {
          // Insert system prompt at the very beginning of the history if not already there
          updatedHistory[0].parts[0].text = `[SYSTEM INSTRUCTION: ${systemPrompt}]\n\n${updatedHistory[0].parts[0].text}`;
          updatedHistory.push({
            role: 'user',
            parts: attachment ? [
              { text: message },
              { inlineData: { mimeType: attachment.mimeType, data: attachment.data } }
            ] : [{ text: message }]
          });
        }

        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: updatedHistory,
            generationConfig: { temperature: 0.7, maxOutputTokens: 2048 }
          })
        });

        if (!response.ok) {
          const err = await response.json().catch(() => ({}));
          console.warn(`Model ${modelName} failed:`, err?.error?.message || response.status);
          lastError = err?.error?.message || `HTTP ${response.status}`;
          if (response.status === 404 || response.status === 400 || response.status === 429) continue;
          throw new Error(lastError);
        }

        const reader = response.body?.getReader();
        if (!reader) throw new Error("Failed to get response reader");

        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed.startsWith('data: ')) {
              try {
                const dataStr = trimmed.substring(6).trim();
                const json = JSON.parse(dataStr);
                const text = json.candidates?.[0]?.content?.parts?.[0]?.text;
                if (text) yield text;
              } catch (e) { }
            }
          }
        }
        return;
      } catch (err: any) {
        lastError = err.message;
        if (modelName === models[models.length - 1]) throw err;
      }
    }

    yield `Connection error: ${lastError || "I encountered an issue processing your request."}`;
  }
}

export const genSparkAIService = new GenSparkAIService();
