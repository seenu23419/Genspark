# API Keys Setup Guide for GenSpark

This guide shows **where to get** each API key and **how to configure** them.

---

## Overview: Which Keys Are Required?

| Service | Key Name | Required? | Cost | How To Get |
|---------|----------|-----------|------|-----------|
| **Supabase** (Database) | `VITE_SUPABASE_URL`<br>`VITE_SUPABASE_ANON_KEY` | ✓ YES | Free tier | [supabase.com](https://supabase.com) |
| **Judge0** (Self-Hosted) | `VITE_JUDGE0_URL` | Optional | Free (local) | Run docker-compose |
| **Judge0** (RapidAPI) | `VITE_RAPIDAPI_KEY` | Optional | $1–5/month | [rapidapi.com](https://rapidapi.com) |
| **Gemini** (AI Chat/Fix) | `VITE_GEMINI_API_KEY` | ✓ YES (if using AI) | Free tier | [console.cloud.google.com](https://console.cloud.google.com) |
| **OpenAI** (AI Fallback) | `VITE_OPENAI_API_KEY` | Optional | Paid ($5+) | [platform.openai.com](https://platform.openai.com) |
| **Razorpay** (Payments) | `VITE_RAZORPAY_KEY_ID`<br>`VITE_RAZORPAY_KEY_SECRET` | Optional | 2% + ₹0 | [razorpay.com](https://razorpay.com) |

---

## Step-by-Step Setup

### 1. Supabase (Database) — ✓ REQUIRED

**Why**: Stores user profiles, code snippets, progress, lessons.

#### Get the Keys:

1. Go to [supabase.com](https://supabase.com) → Sign up (free)
2. Create a new project (e.g., "GenSpark")
3. Wait for it to initialize (~1 min)
4. Go to **Settings** → **API**
5. Copy:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **Anon (public) Key** → `VITE_SUPABASE_ANON_KEY`

#### Add to `.env.local`:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

### 2. Judge0 (Self-Hosted) — Optional, FREE

**Why**: Executes C, C++, Python code locally without cost.

#### Setup:

```bash
# From the gens folder
docker-compose up -d
```

Verify:
```bash
curl http://localhost:2358/languages
```

#### Add to `.env.local`:

```env
VITE_JUDGE0_URL=http://localhost:2358
```

**Note**: No API key needed if self-hosted. Stop here if you're running locally.

---

### 3. Judge0 RapidAPI (Fallback, Optional, Paid)

**Why**: If self-hosted Judge0 goes down, use this as fallback.

#### Get the Key:

1. Go to [rapidapi.com](https://rapidapi.com)
2. Sign up (free)
3. Search for **"Judge0"** in the marketplace
4. Click **"Judge0 Community"** or **"Judge0 Official"**
5. Click **"Subscribe to Test"** (free tier)
6. Go to **Endpoints** → Copy your **X-RapidAPI-Key**

#### Add to `.env.local`:

```env
VITE_RAPIDAPI_KEY=your-rapidapi-key-here
```

**Cost**: ~$1–5/month for free tier, or pay-as-you-go (per execution).

---

### 4. Gemini API (AI Chat/Fix) — ✓ REQUIRED (for AI features)

**Why**: Powers "Ask AI to Fix" and AI chat features.

#### Get the Key:

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create a new project (or use existing)
3. Enable **Generative Language API** (search in API library)
4. Go to **Credentials** → **Create Credential** → **API Key**
5. Copy the **API Key**

#### Add to `.env.local`:

```env
VITE_GEMINI_API_KEY=AIzaSy...
```

**Cost**: Free tier (60 requests/minute). Paid plans available.

---

### 5. OpenAI (AI Fallback, Optional, Paid)

**Why**: Fallback for AI features if Gemini fails.

#### Get the Key:

1. Go to [platform.openai.com](https://platform.openai.com)
2. Sign up / Log in
3. Go to **API Keys** → **Create new secret key**
4. Copy the key (⚠️ save it immediately, can't be viewed again)

#### Add to `.env.local`:

```env
VITE_OPENAI_API_KEY=sk-proj-...
```

**Cost**: Paid. Start with $5 credit, then pay-as-you-go (~$0.01–0.10 per request depending on model).

---

### 6. Razorpay (Payments, Optional)

**Why**: Handle premium subscriptions (if you offer paid tiers).

#### Get the Keys:

1. Go to [razorpay.com](https://razorpay.com)
2. Sign up / Log in (requires Indian bank account or address)
3. Go to **Settings** → **API Keys**
4. Copy:
   - **Key ID** → `VITE_RAZORPAY_KEY_ID`
   - **Key Secret** → `VITE_RAZORPAY_KEY_SECRET` (keep secret!)

#### Add to `.env.local`:

```env
VITE_RAZORPAY_KEY_ID=rzp_live_...
VITE_RAZORPAY_KEY_SECRET=... (KEEP SECRET - never commit!)
```

Also set:
```env
VITE_RAZORPAY_PLAN_ID=plan_Gr4RVS4t4k2q9e  # Test plan; create your own for production
VITE_RAZORPAY_WEBHOOK_SECRET=your_webhook_secret
```

---

## Complete `.env.local` Template

Create or edit `.env.local` in your project root with all keys:

```env
# ===== REQUIRED =====
# Supabase (Database)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Gemini (AI Chat/Fix)
VITE_GEMINI_API_KEY=AIzaSy...

# ===== OPTIONAL =====
# Judge0 (Code Execution)
VITE_JUDGE0_URL=http://localhost:2358
VITE_RAPIDAPI_KEY=your-rapidapi-key

# OpenAI (AI Fallback)
VITE_OPENAI_API_KEY=sk-proj-...

# Razorpay (Payments, if needed)
VITE_RAZORPAY_KEY_ID=rzp_live_...
VITE_RAZORPAY_KEY_SECRET=...
VITE_RAZORPAY_PLAN_ID=plan_Gr4RVS4t4k2q9e
VITE_RAZORPAY_WEBHOOK_SECRET=...

# API Server (optional, if using backend)
VITE_API_URL=http://localhost:5000
```

---

## Running Your App

After setting up `.env.local`:

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The app will automatically read keys from `.env.local`.

---

## Production Deployment (Netlify, Vercel, etc.)

### For Netlify:

1. Go to your Netlify site dashboard
2. **Site Settings** → **Build & Deploy** → **Environment**
3. **Edit Variables** → Add each key:
   - `VITE_SUPABASE_URL=...`
   - `VITE_SUPABASE_ANON_KEY=...`
   - `VITE_GEMINI_API_KEY=...`
   - `VITE_JUDGE0_URL=...` (if self-hosted, use your VPS IP)
   - etc.

4. Redeploy your site

### For Vercel:

1. Go to project settings
2. **Environment Variables**
3. Add each variable (same as Netlify)

### For Other Platforms:

Consult their docs on setting environment variables. Generally, there's a UI or CLI to add secrets.

---

## Verifying Keys Work

### Test Supabase:

```bash
# In browser console (F12)
import { createClient } from '@supabase/supabase-js';
const supabase = createClient(
  'https://your-project.supabase.co',
  'your-anon-key'
);
const { data } = await supabase.from('users').select('count');
console.log(data); // Should work
```

### Test Gemini:

```bash
# Run the app and try "Ask AI" feature
# If it works without error, key is valid
```

### Test Judge0:

```bash
curl http://localhost:2358/languages
# Should return JSON list of supported languages
```

---

## Security Best Practices

⚠️ **DO NOT:**
- Commit `.env.local` to Git
- Share API keys in messages/emails
- Use production keys in development

✓ **DO:**
- Add `.env.local` to `.gitignore`
- Store secrets in deployment platform's secret manager
- Rotate keys regularly
- Use separate keys for dev/production

---

## Troubleshooting

### "API key is invalid"
- Verify you copied the full key (no extra spaces)
- Check the key is for the correct service
- Regenerate the key if uncertain

### "Supabase connection failed"
- Verify `VITE_SUPABASE_URL` ends with `.supabase.co`
- Check internet connection
- Verify anon key hasn't been revoked

### "Judge0 not responding"
- Ensure `docker-compose up -d` is running
- Try `curl http://localhost:2358/system_info`
- Check Docker logs: `docker logs judge0`

### "Gemini API limit exceeded"
- Upgrade to paid plan on Google Cloud Console
- Or switch to Piston (free, no auth needed)

---

## Summary

| Step | Action | Time |
|------|--------|------|
| 1 | Create Supabase project + copy keys | 5 min |
| 2 | Enable Gemini API + get key | 5 min |
| 3 | Add keys to `.env.local` | 2 min |
| 4 | (Optional) Start Judge0 with docker-compose | 2 min |
| 5 | (Optional) Sign up for RapidAPI Judge0 | 3 min |
| 6 | Run `npm run dev` and test | 5 min |

**Total**: ~15–25 minutes to have a fully working app.

---

## Need Help?

- **Supabase Docs**: https://supabase.com/docs
- **Gemini API Docs**: https://ai.google.dev
- **Judge0 Docs**: https://judge0.com
- **OpenAI Docs**: https://platform.openai.com/docs
- **Razorpay Docs**: https://razorpay.com/docs
