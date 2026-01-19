
// Mock Deno types for the edge function environment
import "jsr:@supabase/functions-js/edge-runtime.d.ts"

// Note: In a real deployment, we would use Deno imports for OpenAI.
// We will use a simple fetch implementation to avoid dependency complexity in this single file artifact.

Deno.serve(async (req) => {
    // CORS Headers
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    }

    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const { language, code, error } = await req.json()

        // Get API Keys from Env
        const openaiKey = Deno.env.get('OPENAI_API_KEY')
        const geminiKey = Deno.env.get('GEMINI_API_KEY')

        if (!openaiKey && !geminiKey) {
            return new Response(JSON.stringify({ message: "No AI API Keys configured on server." }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 500
            });
        }

        let fixedCodeText = "";

        // Prompt
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
        "fixedCode": " The corrected code ONLY",
        "tips": "One short tip to avoid this in future"
      }
      Do NOT wrap the JSON in markdown blocks. Just raw JSON.
    `;

        // Try OpenAI
        if (openaiKey) {
            const response = await fetch("https://api.openai.com/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${openaiKey}`
                },
                body: JSON.stringify({
                    model: "gpt-4o-mini",
                    messages: [{ role: "user", content: prompt }],
                    response_format: { type: "json_object" }
                })
            });
            const data = await response.json();
            const content = data.choices[0].message.content;
            fixedCodeText = content;
        }
        // Fallback to Gemini (Simulated call structure as Gemini REST API differs)
        else if (geminiKey) {
            // ... implementation for Gemini REST would go here
            // For brevity in this artifact, we assume OpenAI is primary or return a placeholder
            fixedCodeText = JSON.stringify({
                explanation: "Using Gemini Backup (Mock)",
                fixedCode: code,
                tips: "Gemini backend integration requires more complex setup in Deno."
            });
        }

        // Parse the result
        let result;
        try {
            result = JSON.parse(fixedCodeText);
        } catch (e) {
            result = { explanation: "AI Parsing Error", fixedCode: fixedCodeText, tips: "" };
        }

        return new Response(
            JSON.stringify(result),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } },
        )
    } catch (error) {
        return new Response(
            JSON.stringify({ error: error.message }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 },
        )
    }
})
