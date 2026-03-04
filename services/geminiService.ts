
export interface MediaPart {
  mimeType: string;
  data: string;
}

// Helper to check if a key is a dummy placeholder from .env.example
const isPlaceholderKey = (key: string): boolean => {
  if (!key) return true;
  const placeholders = [
    'your_gemini_api_key',
    'your_openai_api_key',
    'placeholder',
    'api_key_here',
    'dummy'
  ];
  return placeholders.some(p => key.toLowerCase().includes(p));
};

// Safely access environment variables
const getApiKey = (provider: 'gemini' | 'openai'): string => {
  try {
    let key = '';
    if (provider === 'gemini') {
      key = (typeof (import.meta as any).env !== 'undefined' ? (import.meta as any).env.VITE_GEMINI_API_KEY : '') ||
        (typeof process !== 'undefined' && process.env ? (process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || process.env.API_KEY) : '');
    } else {
      key = (typeof (import.meta as any).env !== 'undefined' ? (import.meta as any).env.VITE_OPENAI_API_KEY : '') ||
        (typeof process !== 'undefined' && process.env ? (process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY) : '');
    }

    return isPlaceholderKey(key) ? '' : key;
  } catch {
    return '';
  }
};

export class GlintoAIServiceImpl {
  private geminiKey: string = '';
  private openaiKey: string = '';

  constructor() {
    this.geminiKey = getApiKey('gemini');
    this.openaiKey = getApiKey('openai');
  }

  async *generateChatStream(message: string, isPro: boolean = false, history: any[] = [], attachment?: MediaPart) {
    console.log('[Glinto AI] generateChatStream called');
    if (!this.geminiKey) this.geminiKey = getApiKey('gemini');
    if (!this.openaiKey) this.openaiKey = getApiKey('openai');
    console.log('[Glinto AI] Keys available - OpenAI:', !!this.openaiKey, 'Gemini:', !!this.geminiKey);

    // OPTIMIZATION: Limit context to last 10 messages (5 turns) for performance and cost
    const recentHistory = history.slice(-10);

    // Strategy: Try OpenAI first (highest reasoning), then Gemini fallback
    if (this.openaiKey) {
      try {
        console.log("Glinto AI: Attempting with OpenAI...");
        yield* this.generateOpenAIStream(message, isPro, recentHistory, attachment);
        return;
      } catch (e: any) {
        console.warn("Glinto AI: OpenAI failed, falling back to Gemini.", e.message);
      }
    }

    if (this.geminiKey) {
      try {
        console.log("Glinto AI: Attempting with Gemini...");
        yield* this.generateGeminiStream(message, isPro, recentHistory, attachment);
        return;
      } catch (e: any) {
        console.error("Glinto AI: Gemini also failed.", e.message);
        yield `⚠️ **System Note**: ${e.message || "I encountered an issue connecting to the AI brain. Please check your internet or try again."}`;
      }
    } else {
      console.log('[Glinto AI] No API keys available');
      // Offline mode message
      const isDev = (import.meta as any).env.DEV;
      if (isDev) {
        yield "🤖 **Glinto AI (Setup Required)**: I'm currently in 'offline mode' because your AI keys are missing. \n\n**Quick Fix**: Please add your `VITE_GEMINI_API_KEY` to your `.env.local` file and restart the server! 🚀";
      } else {
        yield "🤖 **Glinto AI (Offline)**: I'm currently in 'offline mode' because no valid API key was found in the environment variables.";
      }
    }
  }

  private async *generateOpenAIStream(message: string, isPro: boolean, history: any[], attachment?: MediaPart) {
    const url = "https://api.openai.com/v1/chat/completions";
    const systemPrompt = this.getSystemPrompt(isPro);

    const messages: any[] = [
      { role: "system", content: systemPrompt },
      ...history.map(h => ({
        role: h.role === 'model' || h.role === 'assistant' ? 'assistant' : 'user',
        content: h.parts ? h.parts[0].text : h.content
      })),
      {
        role: "user",
        content: attachment
          ? [
            { type: "text", text: message },
            { type: "image_url", image_url: { url: `data:${attachment.mimeType};base64,${attachment.data}` } }
          ]
          : message
      }
    ];

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${this.openaiKey}`
      },
      body: JSON.stringify({
        model: isPro ? "gpt-4o" : "gpt-4o-mini",
        messages,
        stream: true,
        max_tokens: 4096
      })
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error?.message || response.statusText);
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
        if (trimmed === 'data: [DONE]') return;
        if (trimmed.startsWith('data: ')) {
          try {
            const dataString = trimmed.substring(6);
            if (dataString === '[DONE]') return;
            const json = JSON.parse(dataString);
            const content = json.choices?.[0]?.delta?.content;
            if (content) yield content;
          } catch (e) { }
        }
      }
    }
  }

  private async *generateGeminiStream(message: string, isPro: boolean, history: any[], attachment?: MediaPart) {
    // Current valid Gemini model list - prioritized for speed and availability
    const models = ['gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-1.5-flash-8b', 'gemini-1.5-pro'];
    const apis = ['v1beta', 'v1'];
    const systemPrompt = this.getSystemPrompt(isPro);
    let lastError = '';

    for (const apiVersion of apis) {
      for (const modelName of models) {
        try {
          // Adjust payload for v1 vs v1beta (v1 often requires system_instruction in specific format)
          const isV1 = apiVersion === 'v1';
          const url = `https://generativelanguage.googleapis.com/${apiVersion}/models/${modelName}:streamGenerateContent?alt=sse&key=${this.geminiKey}`;

          console.log(`[Gemini API] Querying: ${apiVersion}/${modelName}`);

          const payload: any = {
            contents: [],
            generationConfig: { temperature: 0.8, maxOutputTokens: 4096 },
            safetySettings: [
              { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
              { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
              { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
              { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" }
            ]
          };

          // Handle System Prompt (v1/v1beta differences)
          if (isV1 || apiVersion === 'v1beta') {
            payload.system_instruction = { parts: [{ text: systemPrompt }] };
          }

          if (history.length === 0) {
            const parts: any[] = [{ text: message }];
            if (attachment) {
              parts.push({ inlineData: { mimeType: attachment.mimeType, data: attachment.data } });
            }
            payload.contents.push({ role: 'user', parts });
          } else {
            const contents = JSON.parse(JSON.stringify(history));
            const currentParts: any[] = [{ text: message }];
            if (attachment) {
              currentParts.push({ inlineData: { mimeType: attachment.mimeType, data: attachment.data } });
            }
            contents.push({ role: 'user', parts: currentParts });
            payload.contents = contents;
          }

          const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });

          if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            const errorMsg = err.error?.message || response.statusText;
            console.error(`[Gemini API] Error with ${apiVersion}/${modelName}:`, errorMsg);

            // Short-circuit: If API key is invalid, don't keep trying other models
            if (response.status === 400 && errorMsg.toLowerCase().includes('key')) {
              throw new Error("Invalid API Key. Please verify your credentials in .env.local");
            }

            throw new Error(errorMsg);
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
              if (!trimmed) continue;

              // Handle both "data: " and raw JSON chunks (Gemini can be inconsistent)
              let dataStr = trimmed;
              if (trimmed.startsWith('data: ')) {
                dataStr = trimmed.substring(6);
              }

              if (dataStr === '[DONE]') return;

              try {
                const json = JSON.parse(dataStr);
                // Handle both streaming chunk formats
                const text = json.candidates?.[0]?.content?.parts?.[0]?.text;
                if (text) yield text;
              } catch (e) {
                // Ignore partial JSON chunks
                continue;
              }
            }
          }
          return;
        } catch (err: any) {
          lastError = err.message;
          console.warn(`[Gemini API] ${apiVersion}/${modelName} failed.`, err.message);
          // Only throw if we've tried everything
          if (apiVersion === apis[apis.length - 1] && modelName === models[models.length - 1]) throw err;
        }
      }
    }
  }

  async fixCode(language: string, code: string, error: string): Promise<{ explanation: string; fixedCode: string; tips: string }> {
    const prompt = `
      You are an expert coding tutor.
      The user has written the following ${language} code:
      \`\`\`${language}
      ${code}
      \`\`\`
      
      They encountered this error:
      "${error}"
      
      Please analyze the code and the error.
      Return ONLY a JSON object with this structure:
      {
        "explanation": "Brief explanation of what was wrong",
        "fixedCode": "The corrected code ONLY",
        "tips": "One short tip to avoid this in future"
      }
      Do NOT wrap the JSON in markdown blocks. Just raw JSON.
    `;

    // Re-use the existing stream logic but buffer it, or create a simple generation method
    // For simplicity, we'll collect the stream output
    let fullResponse = '';
    const stream = this.generateChatStream(prompt, false); // Assuming free tier logic for fix

    for await (const chunk of stream) {
      fullResponse += chunk;
    }

    // Clean up response if it contains markdown code blocks
    fullResponse = fullResponse.replace(/```json/g, '').replace(/```/g, '').trim();

    try {
      return JSON.parse(fullResponse);
    } catch (e) {
      console.error("AI Fix JSON Parse Error", e);
      return {
        explanation: "Could not parse AI response.",
        fixedCode: code,
        tips: "Try again."
      };
    }
  }

  async executeCodeSimulated(language: string, sourceCode: string, stdin: string = ""): Promise<{ stdout: string; stderr: string; status: { id: number; description: string } }> {
    const prompt = `
      You are a high-performance code execution engine for ${language}.
      
      INPUT CODE:
      \`\`\`${language}
      ${sourceCode}
      \`\`\`
      
      STDIN (User Input):
      "${stdin}"
      
      TASK: 
      1. Mentally execute this code step-by-step.
      2. If there are syntax errors, provide the EXACT compiler error message in 'stderr'.
      3. If valid, provide the EXACT 'stdout' that would result from running this code.
      4. Note: If the code uses recursion, infinite loops, or complex pointers, follow the logic accurately.
      
      RETURN ONLY a JSON object:
      {
        "stdout": "The standard output captured",
        "stderr": "The standard error or compiler error (if any)",
        "status": { "id": 3, "description": "Accepted" }
      }
      
      Status IDs: 3 (Accepted), 6 (Compilation Error), 11 (Runtime Error).
      Do NOT wrap in markdown.
    `;

    let fullResponse = '';
    const stream = this.generateChatStream(prompt, false);

    for await (const chunk of stream) {
      fullResponse += chunk;
    }

    // Check if the response is an error message rather than JSON
    if (fullResponse.includes('⚠️') || fullResponse.includes('System Note')) {
      return {
        stdout: "",
        stderr: "The AI Mentor is currently overwhelmed or out of quota. " + fullResponse,
        status: { id: 13, description: "AI Service Busy" }
      };
    }

    fullResponse = fullResponse.replace(/```json/g, '').replace(/```/g, '').trim();

    try {
      return JSON.parse(fullResponse);
    } catch (e) {
      console.error("AI Simulator JSON Parse Error. Response:", fullResponse);
      return {
        stdout: "",
        stderr: "AI Simulator failed to format the output correctly. Please try again.",
        status: { id: 13, description: "Internal Error" }
      };
    }
  }

  private getSystemPrompt(isPro: boolean): string {
    return `You are a patient, supportive coding mentor. Your role is to help learners understand and fix their code.

AI MENTOR PHILOSOPHY:
- Never give full corrected code or copy-paste solutions
- Never rewrite user code
- Help users think critically and solve problems independently
- Explain WHAT went wrong, WHY it happened, and HOW to think about fixing it

WHEN ANALYZING ERRORS:
1. Identify the exact line/concept that failed
2. Explain the compiler/runtime error message in simple terms
3. Explain what programming concept was violated (e.g., "arrays are 0-indexed", "functions need return types", etc.)
4. Guide the user to fix it themselves - don't provide the fix
5. Be encouraging and calm

RESPONSE FORMAT:
- Use plain, conversational language OR follow the specific structured format if asked (e.g. using PREFIX: content)
- NO code blocks from user's code
- NO syntax highlighting
- NO markdown code fences
- At most 2-3 lines of example pseudocode if needed for illustration

TONE:
- Calm and patient (never condescending)
- Teacher-like and clear
- Encouraging ("You're on the right track", "Good thinking")
- No spoon-feeding

EXAMPLE ERROR ANALYSIS:
User Error: "undefined variable 'x'"
❌ BAD: "Just declare x = 0 at the top"
✅ GOOD: "It looks like 'x' was used on line 5 but never declared. In C, all variables must be declared with their type before they're used. Where in your code should x be declared, and what type should it be?"`;
  }
}

const instance = new GlintoAIServiceImpl();
export const GlintoAIService = instance;
export const glintoAIService = instance;
