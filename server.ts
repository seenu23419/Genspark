
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
// @ts-ignore
import rateLimit from 'express-rate-limit';
// @ts-ignore
import pino from 'pino';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const EXECUTE_API_TOKEN = process.env.EXECUTE_API_TOKEN || '';

const logger = pino({ level: process.env.LOG_LEVEL || 'info' });

app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '100kb' }));

// Simple request logger
app.use((req, res, next) => {
  logger.info({ method: req.method, path: req.path, ip: req.ip }, 'incoming request');
  next();
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'active',
    architecture: 'Supabase-Client-Side',
    message: 'GenSpark backend is operating in stateless mode. All data is handled by Supabase.'
  });
});

// Rate limiter for execute endpoint
const execLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // limit each IP to 30 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => res.status(429).json({ error: 'Too many execute requests, please try again later.' })
});

// Execute code via Piston (preferred) or Judge0 (fallback)
app.post('/api/execute', execLimiter, async (req, res) => {
  try {
    if (EXECUTE_API_TOKEN) {
      const header = (req.headers['x-exec-token'] || req.headers['x-exec-token'.toLowerCase()]) as string | undefined;
      if (!header || header !== EXECUTE_API_TOKEN) {
        logger.warn({ ip: req.ip }, 'Unauthorized execute attempt');
        return res.status(401).json({ error: 'Unauthorized' });
      }
    }

    const { language, code } = req.body || {};
    if (!language || !code) return res.status(400).json({ error: 'Missing language or code in request body.' });

    if (typeof code !== 'string' || code.length > 20000) {
      return res.status(400).json({ error: 'Code missing or too large (max 20000 chars).' });
    }

    const pistonBase = 'https://emkc.org/api/v2/piston/execute';
    const rapidApiKey = process.env.RAPIDAPI_KEY || process.env.JUDGE0_RAPIDAPI_KEY || '';
    const judge0Base = 'https://judge0-ce.p.rapidapi.com';

    // Try Piston first
    try {
      const pistonLangMap: Record<string, string> = {
        'python': 'python3',
        'javascript': 'javascript',
        'typescript': 'typescript',
        'java': 'java',
        'c': 'c',
        'cpp': 'cpp',
        'go': 'go',
        'rust': 'rust',
        'ruby': 'ruby',
        'php': 'php',
        'kotlin': 'kotlin',
        'swift': 'swift',
        'csharp': 'csharp',
      };

      const pistonLang = pistonLangMap[String(language).toLowerCase()];
      if (pistonLang) {
        const response = await fetch(pistonBase, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ language: pistonLang, version: '*', files: [{ content: code }] })
        });

        if (response.ok) {
          const data = await response.json();
          const { run, compile } = data;
          return res.json({
            stdout: run?.stdout || null,
            stderr: run?.stderr || null,
            compile_output: compile?.stderr || compile?.stdout || null,
            message: run?.signal ? `Signal: ${run.signal}` : null,
            time: null,
            memory: null,
            status: { id: run?.code === 0 ? 3 : 4, description: run?.code === 0 ? 'Accepted' : 'Runtime Error' }
          });
        }
      }
    } catch (pErr: any) {
      logger.warn({ err: pErr?.message || pErr }, 'Piston execution failed');
    }

    // Fallback: Judge0 (requires RapidAPI key)
    if (!rapidApiKey) throw new Error('No Piston support and Judge0 RapidAPI key not configured.');

    const judgeLangMap: Record<string, number> = {
      'c': 50, 'cpp': 54, 'java': 62, 'python': 71, 'javascript': 63, 'typescript': 74,
      'csharp': 51, 'go': 60, 'rust': 73, 'swift': 83, 'ruby': 72, 'php': 68, 'sql': 82,
      'kotlin': 78, 'r': 80, 'perl': 85
    };

    const languageId = judgeLangMap[String(language).toLowerCase()];
    if (!languageId) throw new Error(`Language ${language} not supported by server executors.`);

    // Create submission
    const createResp = await fetch(`${judge0Base}/submissions?base64_encoded=true&wait=false`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-RapidAPI-Key': rapidApiKey,
        'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com'
      },
      body: JSON.stringify({ language_id: languageId, source_code: Buffer.from(code).toString('base64') })
    });

    if (!createResp.ok) throw new Error(`Judge0 create submission failed: ${createResp.statusText}`);
    const { token } = await createResp.json();

    // Poll for result
    const maxAttempts = 12;
    const intervalMs = 1000;
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const pollResp = await fetch(`${judge0Base}/submissions/${token}?base64_encoded=true`, {
        headers: { 'X-RapidAPI-Key': rapidApiKey, 'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com' }
      });

      if (!pollResp.ok) throw new Error(`Judge0 poll failed: ${pollResp.statusText}`);
      const result = await pollResp.json();
      if (result.status && result.status.id > 2) {
        return res.json({
          stdout: result.stdout ? Buffer.from(result.stdout, 'base64').toString('utf8') : null,
          stderr: result.stderr ? Buffer.from(result.stderr, 'base64').toString('utf8') : null,
          compile_output: result.compile_output ? Buffer.from(result.compile_output, 'base64').toString('utf8') : null,
          message: result.message ? Buffer.from(result.message, 'base64').toString('utf8') : null,
          time: result.time || null,
          memory: result.memory || null,
          status: result.status
        });
      }

      await new Promise(r => setTimeout(r, intervalMs));
    }

    throw new Error('Execution timed out.');
  } catch (err: any) {
    logger.error({ err: err?.message || err }, 'Execution error');
    res.status(500).json({ error: err.message || 'Execution failed' });
  }
});


if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    logger.info(`🚀 GenSpark Stateless Server running on port ${PORT}`);
  });
}

export default app;

