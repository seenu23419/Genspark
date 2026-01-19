<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# GenSpark

GenSpark is an AI-powered coding education platform that helps users learn programming languages through interactive lessons, challenges, and real-time code execution.

## Premium Features

GenSpark offers both free and premium subscription plans:

- **Free Plan**: Limited access to courses, 10 compiler runs per day, 5 AI Tutor requests per day
- **Premium Plan**: Full course access, unlimited compiler runs, unlimited AI Tutor usage, certificate generation, mentor approval, advanced challenges, and no ads (₹49/month)

## Tech Stack

- Frontend: React 18, TypeScript, Tailwind CSS, Vite
- Backend: Supabase (Auth, Database, RLS)
- Payments: Razorpay
- AI: Google Gemini API
- Compiler: Judge0 (Primary), Piston (Fallback)

## Quick Start

**Prerequisites:** Node.js, Docker (optional for Judge0)

### 1. Clone & Install
```bash
git clone <your-repo>
cd gens
npm install
```

### 2. Configure API Keys
Copy [.env.local.example](.env.local.example) to `.env.local` and fill in your keys:

```bash
cp .env.local.example .env.local
```

Then edit `.env.local` with your actual API keys.

**See [API_KEYS_SETUP.md](API_KEYS_SETUP.md) for detailed instructions on where to get each key.**

### 3. (Optional) Start Judge0 Locally
For unlimited code execution without API costs:

```bash
docker-compose up -d
```

See [JUDGE0_SETUP.md](JUDGE0_SETUP.md) for more details.

### 4. Run the App
```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## API Keys Required

| Service | Purpose | Required? | Setup Time |
|---------|---------|-----------|-----------|
| **Supabase** | Database & Auth | ✓ Yes | 5 min |
| **Gemini API** | AI Chat/Fix Code | ✓ Yes | 5 min |
| **Judge0** (Self-Hosted) | Code Execution | No (Free) | 2 min |
| **Piston API** | Code Execution Fallback | No (Free, Public) | 0 min |
| **OpenAI** | AI Fallback | No | - |
| **Razorpay** | Payments (Optional) | No | - |

**👉 [See API_KEYS_SETUP.md](API_KEYS_SETUP.md) for complete setup guide.**

---

## Deployment

### Netlify / Vercel

1. Set environment variables in your dashboard
2. Push to Git
3. Auto-deploys with your keys from platform secrets

**See [API_KEYS_SETUP.md - Production Deployment](API_KEYS_SETUP.md#production-deployment) for steps.**
