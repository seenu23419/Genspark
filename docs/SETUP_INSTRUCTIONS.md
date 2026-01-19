# Setup Instructions for New Features

To fully enable the **Save Code** and **Ask AI to Fix** features, you need to perform a few manual steps in your Supabase project.

## 1. Database Setup (Required for "Saving Code")
The app expects a `snippets` table to store user code.
1. Go to your [Supabase Dashboard](https://supabase.com/dashboard).
2. Open the **SQL Editor**.
3. Copy and paste the content of the file `supabase/migrations/20240104_create_snippets.sql` (located in your project folder).
4. Click **Run**.

## 2. Deploy Edge Function (Required for "Ask AI to Fix")
The "A.I. Fix" button calls a server-side function.
1. Make sure you have the Supabase CLI installed.
2. Run this command in your terminal:
   ```bash
   npx supabase functions deploy fix-code --no-verify-jwt
   ```
   *(If you don't have the CLI configured, you can also copy the content of `supabase/functions/fix-code/index.ts` and create a new function named `fix-code` manually in the Supabase Dashboard).*
3. **Set API Keys**:
   Go to your Supabase Dashboard -> Edge Functions -> `fix-code` -> Manage Secrets, and add:
   - `OPENAI_API_KEY` (sk-...)
   - OR `GEMINI_API_KEY`

## 3. Testing the Runtimes
1. Refresh your app (`npm run dev` should be running).
2. Go to any lesson or compiler screen.
3. Select **Python** as the language.
4. Click **Run Code**. 
   - You should see a "Downloading Runtime..." bar for the first run.
   - It should print the output in the console below.

## Troubleshooting
- **"Supabase not configured"**: Ensure your `.env.local` has `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
- **Runtime Error in Console**: If Python fails to load, check the browser console. It might be a network restriction on the CDN.
