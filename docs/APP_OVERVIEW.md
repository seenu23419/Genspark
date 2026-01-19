# GenSpark Application Master Overview

## 1. System Architecture & File Structure
The application is a **Single Page Application (SPA)** built with React, Vite, and TypeScript. It uses a **custom state-based router** for instant transitions, avoiding the overhead of heavy routing libraries.

### Key Directories
- **`/src/App.tsx`**: Central Router & Auth Listener. Controls the `currentScreen` state.
- **`/src/services/`**: logic layer.
  - `authService.ts`: Handles Supabase Auth, Signups, and Timeouts.
  - `geminiService.ts`: AI interfacing (Gemini 2.0 + OpenAI Fallback).
  - `compilerService.ts`: Sandboxing and code execution logic.
- **`/src/screens/`**: Feature modules.
  - `auth/`: Login, Signup, OTP (Email Verification).
  - `home/`: Dashboard with gamification stats.
  - `chat/`: AI Tutor interface.
  - `compiler/`: IDE with persistence and tab support.
  - `lessons/`: Course content.

---

## 2. Navigation & User Flow (Updated)

The navigation is designed for **speed** (`0ms` transition overhead).

### A. Initialization Flow
1.  **Launch**: `App.tsx` mounts.
2.  **Auth Check**: `AuthContext` runs `initSession`.
    *   **Result**: Instant redirect.
    *   *Change*: Removed artificial 2-second splash delay. Now transitions immediately upon data availability.
3.  **Destination**:
    *   **Authenticated**: $\rightarrow$ `HOME` (Dashboard).
    *   **Guest**: $\rightarrow$ `WELCOME` Landing Page.

### B. Authentication Flow
1.  **Signup**: User enters details $\rightarrow$ `authService.signUp`.
    *   *Safety*: Request wrapped in **10s Timeout** to prevent hanging.
2.  **Verification**: Success $\rightarrow$ **Explicit Redirect** to `OTP` screen.
3.  **Completion**: OTP Verified $\rightarrow$ `HOME`.

### C. Core Usage Flow
*   **Dashboard (`HOME`)**: Central hub. Access to:
    *   **Pathfinder (`EXPLORE`)**: Select languages/courses.
    *   **AI Tutor (`CHAT`)**: Sidebar-based chat interface.
    *   **Sandbox (`COMPILER`)**: Persistent code editor.
    *   **Profile**: Stats and settings.

---

## 3. Performance & Time Analysis

| Action | Estimated Time | Implementation Detail |
| :--- | :--- | :--- |
| **App Startup** | **~100ms** | Reduced from 2.2s. Removed fixed splash timer. |
| **Screen Transition** | **0ms** | React State change (Virtual DOM diffing only). |
| **Login/Signup** | **200-800ms** | Supabase API latency. Hard capped at **10s** (Timeout). |
| **AI Response** | **~400ms (TTFT)** | Fast streaming. Context limited to **last 5 turns** to minimize token latency. |
| **Code Compilation** | **~1-2s** | Remote execution via Judge0/Piston API. |

---

## 4. Total App Prompt (AI System)
The AI Tutor (`geminiService.ts`) enables the "Pro" coding companion experience.

**System Prompt:**
> "You are GenSpark AI, an intelligent and friendly coding companion. [If Pro: The user is a PRO member; provide expert-level depth.]
> 
> Guidelines:
> 1. **Style**: Use clean Markdown with headers, lists, and tables.
> 2. **Tone**: Encouraging, professional but enthusiastic. 🚀
> 3. **Code**: Use Markdown code blocks with language tags.
> 4. **Visuals**: Analyze images thoroughly if provided.
> 5. **Identity**: You are built by the GenSpark team to help users learn coding."

**Optimization**: The service now proactively **truncates history** to the last 10 messages before sending to the API, ensuring the prompt remains lean and fast.

---

## 5. Data & State Model (`types.ts`)

### Global User Object
This object is persisted in `AuthContext` and accessible everywhere:
```typescript
interface User {
  _id: string;          // Database UUID
  name: string;         // Display Name
  email: string;
  xp: number;           // Gamification Score
  streak: number;       // Daily active streak
  isPro: boolean;       // Subscription Status
  completedLessonIds: string[]; // Progress tracking
  settings: {           // User preferences
    theme: 'dark' | 'light';
    notifications: boolean;
  }
}
```

### Compiler State (`Compiler.tsx`)
*   **Code Cache**: `Record<string, string>` - Persists code per language in memory so switching languages doesn't wipe work.
*   **Editor**: Supports `Tab` indentation (2 spaces) and clipboard operations.

---

## 6. Recent Fixes & improvements
1.  **Sidebar UI**: Added toggle button in Header and "Collapse" button inside sidebar for full accessibility on Mobile/Desktop.
2.  **Auth Robustness**: Login now handles "missing profile" race conditions gracefully by generating a temporary user object.
3.  **Build Health**: Removed duplicate `case 'SIGNUP'` label in router to fix build warnings.
