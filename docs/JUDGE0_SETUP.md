# Judge0 Self-Hosted Setup Guide

This guide covers setting up **Judge0 self-hosted** with **Piston as fallback** for unlimited code execution at lowest cost.

## Architecture

```
User Code
   ↓
[App: Compiler.tsx]
   ↓
executionService.ts (smart fallback chain)
   ├─ 1. Self-hosted Judge0 (http://localhost:2358) [FREE, if running]
   ├─ 2. Piston API (https://emkc.org/api/v2/piston) [FREE, public]
   └─ 3. Judge0 RapidAPI [PAID, last resort]
   ↓
Execution Result → Save to Supabase
```

---

## Quick Start (Docker)

### Prerequisites
- [Docker](https://docker.com) and [Docker Compose](https://docs.docker.com/compose/install/) installed

### Step 1: Start Judge0 Locally

```bash
docker-compose up -d
```

This launches:
- **Judge0 API** on `http://localhost:2358`
- **Redis** (cache)
- **PostgreSQL** (database)

Verify it's running:
```bash
curl http://localhost:2358/languages
```

You should see a JSON list of supported languages.

### Step 2: Update `.env.local`

```env
# Code Execution
VITE_JUDGE0_URL=http://localhost:2358

# Keep Supabase and other keys as before
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_GEMINI_API_KEY=your_gemini_api_key
```

### Step 3: Use in Your App

The `executionService` is already integrated. When a user runs code:

1. App calls `executionService.executeCode(language, code, userId)`
2. Service tries:
   - Self-hosted Judge0 → ✓ (no cost)
   - Falls back to Piston → ✓ (free public API)
   - Falls back to RapidAPI Judge0 → ✓ (requires key, has per-call cost)

**Result is saved to Supabase automatically** for persistence.

---

## Production Deployment

### Option A: Self-Host on a VPS

**Cost**: ~$5–20/month for a small VPS (Linode, DigitalOcean, Hetzner)

```bash
# SSH into your VPS
ssh root@your-vps-ip

# Clone your repo and start Judge0
git clone <your-repo>
cd gens
docker-compose up -d
```

Update your app's `VITE_JUDGE0_URL` to point to your VPS:
```env
VITE_JUDGE0_URL=http://your-vps-ip:2358
```

### Option B: Use Render or Fly.io (Managed Containers)

If you prefer not to manage a VPS, you can deploy Judge0 on Render or Fly.io with auto-scaling.

### Option C: Rely on Piston + RapidAPI Fallback

If you don't want to self-host:
- **Piston** (free): handles most languages instantly
- **RapidAPI Judge0** (paid): use as fallback for languages Piston doesn't support

Cost: ~$0.001 per execution (RapidAPI pricing)

---

## Monitoring

### Check Judge0 Status
```bash
curl http://localhost:2358/system_info
```

### View Logs
```bash
docker logs judge0
docker logs judge0_redis
docker logs judge0_db
```

### Stop Services
```bash
docker-compose down
```

### Restart Services
```bash
docker-compose restart judge0
```

---

## Supported Languages

Judge0 supports: C, C++, Java, Python, JavaScript, TypeScript, C#, Go, Rust, Swift, Ruby, PHP, Kotlin, Perl, R, and more.

See `LANGUAGE_MAPPING` in `executionService.ts` for the complete list.

---

## Troubleshooting

### Judge0 not responding
```bash
docker-compose down
docker-compose up -d --build
```

### Port 2358 already in use
Edit `docker-compose.yml` and change the port:
```yaml
ports:
  - "9999:8080"  # Use port 9999 instead
```

Then update `.env.local`:
```env
VITE_JUDGE0_URL=http://localhost:9999
```

### High memory usage
Reduce PostgreSQL/Redis memory in `docker-compose.yml`:
```yaml
db:
  # Add memory limit
  deploy:
    resources:
      limits:
        memory: 512M
```

---

## Cost Summary

| Option | Setup Cost | Monthly Cost | Unlimited? |
|--------|-----------|-------------|-----------|
| Self-hosted (VPS) | ~$0 | $5–20 | ✓ Yes |
| Piston (free) | $0 | $0 | ✓ Yes (public API) |
| RapidAPI Judge0 | $0 | ~$0.001/call | ✓ Yes (with cost) |
| Combination (Piston + RapidAPI fallback) | $0 | ~$0–5 | ✓ Yes |

**Recommended**: Self-hosted Judge0 on a small VPS = unlimited + lowest long-term cost.

---

## Next Steps

1. **Test locally**: Run `npm run dev` and try the compiler with a few code samples.
2. **Deploy to Supabase Edge Functions** if you want backend error handling (optional).
3. **Monitor usage** in Supabase (save execution logs with timestamps/user IDs).
4. **Scale**: If CPU usage is high, upgrade your VPS or use container auto-scaling on Render/Fly.

---

## Links

- [Judge0 Docs](https://judge0.com)
- [Piston Docs](https://github.com/engineer-man/piston)
- [RapidAPI Judge0](https://rapidapi.com/judge0-official/api/judge0)
