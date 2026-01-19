# Environment Variables

This file documents environment variables used by GenSpark.

- `SUPABASE_URL`: Supabase project URL (from project settings).
- `SUPABASE_KEY`: Supabase anon/service key used by the app (keep secret for server-side usage).
- `GEMINI_API_KEY`: Google Gemini API key for AI features.
- `RAPIDAPI_KEY`: RapidAPI key (used for Judge0 via RapidAPI).
- `EXECUTE_API_TOKEN`: Optional token required by the server for `/api/execute` requests. If set, clients must send header `x-exec-token: <token>`.
- `PORT`: Server port (default: `5000`).
- `LOG_LEVEL`: Logging level for server (e.g., `debug`, `info`, `warn`, `error`).

Notes:
- Keep all secret keys out of version control. Use the example files `.env.example` and `.env.local.example` as templates.
- For production deployments (Netlify/Vercel), set these values in the platform's environment variable settings.
