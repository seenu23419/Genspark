# Compiler Configuration & Setup Guide

## ✅ What's Already Fixed

1. **TypeScript Type Errors** - Added `difficultyLevel` to QuizQuestion interface
2. **Bundle Optimization** - Implemented code splitting with esbuild
3. **Error Boundaries** - Enhanced with recovery options, error reporting
4. **Retry Logic** - Added automatic retry (up to 3 attempts) for failed execution
5. **Output Display** - Fixed output not showing during execution
6. **Import Paths** - Fixed PracticeList import path

## 🚀 To Make Compiler Work Properly

### Option 1: Local Judge0 Setup (BEST FOR DEVELOPMENT)

```bash
# Install Docker
# Run Judge0 locally:
docker run -d -p 2358:8080 judge0/judge0:latest

# Then set in .env.local:
VITE_JUDGE0_URL=http://localhost:2358
```

### Option 2: Use Piston API (FREE, NO SETUP)

The app already falls back to Piston automatically if Judge0 isn't available.

### Option 3: Use RapidAPI Judge0 (PAID BUT RELIABLE)

```
# Get API key from: https://rapidapi.com/judge0-official/api/judge0-ce
# Set in .env.local:
VITE_RAPIDAPI_KEY=your_key_here
```

## 🔧 Environment Variables (.env.local)

```env
# Supabase
VITE_SUPABASE_URL=your_url
VITE_SUPABASE_KEY=your_key

# Gemini AI (Optional, for explanations)
VITE_GEMINI_API_KEY=your_key

# Judge0 (Optional, pick one)
VITE_JUDGE0_URL=http://localhost:2358
VITE_RAPIDAPI_KEY=your_key
```

## ✨ Features Now Working

✅ Python execution (Local Pyodide - no backend needed)
✅ C, C++, Java, JavaScript execution (via Piston/Judge0)
✅ Code syntax highlighting
✅ Real-time output display
✅ Error handling with retry logic
✅ AI code explanations
✅ AI code fixes
✅ Mobile coding toolbar
✅ Code snippets save
✅ Certificates on success

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| "Execution failed for language" | Set VITE_JUDGE0_URL or VITE_RAPIDAPI_KEY |
| Python won't run | Already works offline (Pyodide) |
| Slow execution | Run Judge0 locally for instant response |
| Output not showing | Fixed! Try now |
| Code not compiling | Check syntax, use AI Fix button |

## 📊 Execution Flow

```
User writes code → Click "Run" 
    ↓
Python? → Yes → Client-side (Pyodide) → Instant
    ↓ No
Try Self-hosted Judge0 (if VITE_JUDGE0_URL set)
    ↓ Fallback
Try Piston API (free, public)
    ↓ Fallback  
Try RapidAPI Judge0 (if VITE_RAPIDAPI_KEY set)
    ↓ All fail
Show error with retry button
```

## 🎯 Next Steps

1. Set up ONE execution backend (Piston is free!)
2. Test with a simple "Hello World" program
3. Try different languages
4. Use AI explanation if stuck
5. Report any issues with error messages

---
**Note:** The compiler now has automatic retry logic. If execution fails, it will retry up to 3 times.
