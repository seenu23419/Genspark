# GenSpark - Application Documentation

## 1. Problem Statement
Traditional coding education fails to bridge the gap between theoretical knowledge and practical application. Learners often struggle with setting up development environments, receiving immediate feedback on their code, and finding structured, personalized learning paths.

**GenSpark** solves this by providing:
- **Zero-Setup Environment**: An in-browser Integrated Development Environment (IDE) enabling users to code instantly on any device.
- **AI-Powered Tutoring**: A personalized AI tutor (Gemini) that offers real-time hints, explains complex code, and generates custom quizzes.
- **Structured Learning Tracks**: Gamified curriculum for C, C++, Java, Python, and Web Development.
- **Real-Time Assessment**: Instant feedback on coding inputs and quiz performance.

## 2. Technology Stack

### Frontend Core
- **Framework**: [React 19](https://react.dev/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Testing**: Jest, React Testing Library

### UI & Styling
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Animations**: CSS Animations (`animate-in`), Canvas Confetti
- **Components**: Custom accessible components, Framer Motion (implied usage)

### Functional Libraries
- **Code Editor**: `monaco-editor` (VS Code engine) via `@monaco-editor/react`
- **State Management**: `@tanstack/react-query` (Server State), `React Context` (App State)
- **Routing**: `react-router-dom` v6+
- **Markdown**: `react-markdown`, `remark-gfm`
- **Charts**: `recharts` for progress visualization

### Backend & Services (BaaS)
- **Database & Auth**: [Supabase](https://supabase.com/) (PostgreSQL)
- **AI Engine**: Google Gemini API
- **Payments**: Razorpay
- **Monitoring**: Sentry (Error Tracking)
- **Execution**: Web Workers (Client-side execution) / Judge0 API (Server-side optional)

## 3. Application Architecture & Workflow

### 3.1 Authentication Flow
1.  **Splash Screen**: Professional onboarding experience.
2.  **Login/Signup**: Handled via `Supabase Auth`. Supports Email/Password and OAuth providers.
3.  **Protected Routes**: `ProtectedRoute` wrapper ensures only authenticated users access the dashboard.

### 3.2 Learning Workflow
1.  **Dashboard**: User sees enrolled courses and daily progress.
2.  **Course Track**: Users select a language (e.g., Python).
3.  **Lessons**: Interactive content mixed with quizzes.
    *   *AI Integration*: "Explain this code" feature uses Gemini to parse and explain snippets.
4.  **Practice Area**:
    *   User writes code in Monaco Editor.
    *   Code is compiled/executed in a sandboxed Web Worker or sent to Judge0.
    *   Output is displayed in a terminal-like window.

### 3.3 Data Flow
- **User Profile**: Stored in `profiles` table in Supabase.
- **Progress Tracking**: `user_progress` table tracks completed lessons and quiz scores.
- **Certificates**: Generated dynamically using `jspdf` and `html2canvas` upon course completion.

## 4. API Keys & Environment Variables (Secret Management)

To run this application, the following keys must be configured in your `.env` file.  
**DO NOT COMMIT YOUR ACTUAL KEYS TO GITHUB.**

| Variable Name | Description | Service |
| :--- | :--- | :--- |
| `VITE_SUPABASE_URL` | API URL for your database instance | Supabase |
| `VITE_SUPABASE_ANON_KEY` | Public API key for client-side requests | Supabase |
| `VITE_GEMINI_API_KEY` | API key for AI features | Google AI Studio |
| `VITE_RAZORPAY_KEY_ID` | Public Key ID for payment gateway | Razorpay |
| `VITE_RAZORPAY_KEY_SECRET` | Secret Key for payment verification | Razorpay |
| `VITE_SENTRY_DSN` | (Optional) Data Source Name for error logging | Sentry.io |
| `VITE_RAPIDAPI_KEY` | (Optional) Key for Judge0 compiler API | RapidAPI |

## 5. Cost Estimation (Monthly)

This estimate assumes a startup/growth phase with ~1,000 active users.

### **1. Hosting (Frontend)**
*   **Provider**: Vercel / Netlify
*   **Cost**: **$0** (Hobby Tier) or **$20/mo** (Pro Team)
*   *Note*: Free tier is usually sufficient for personal projects or MVPs.

### **2. Database & Backend (Supabase)**
*   **Free Tier**: 500MB Database, 50,000 Monthly Active Users. (**$0/mo**)
*   **Pro Tier**: 8GB Database, Daily backups, higher limits. (**$25/mo**)
*   *Recommendation*: Start Free, upgrade to Pro when database exceeds 500MB.

### **3. AI Costs (Google Gemini)**
*   **Free Tier**: 60 QPM (Queries Per Minute). (**$0/mo**)
*   **Pay-as-you-go**: If you exceed free limits, costs are approx $0.50 / 1M tokens.
*   *Estimate*: **$0 - $10/mo** depending on heavy AI usage.

### **4. Payment Processing (Razorpay)**
*   **Usage Based**: Standard 2% transaction fee per sale.
*   **Fixed Cost**: **$0/mo**.

### **5. Code Execution (Judge0)**
*   **Web Workers**: Runs in user's browser (Free).
*   **RapidAPI Judge0**: Basic free tier (50 requests/day).
*   **Self-Hosted Judge0**: ~$5-10/mo for a small VPS (DigitalOcean/Linode) to host your own compiler server.

### **Total Estimated Running Cost**
- **MVP / Development**: **$0.00 / month**
- **Small Production App**: **~$25.00 - $35.00 / month** (Supabase Pro + Domain Name)

## 6. Implementation Checklist for New Deployments

1.  [ ] **Clone Repository**: `git clone <repo_url>`
2.  [ ] **Install Dependencies**: `npm install`
3.  [ ] **Setup Environment**: Copy `.env.example` to `.env` and fill in keys.
4.  [ ] **Database Setup**: Run SQL migrations in Supabase Dashboard (found in `/supabase/migrations`).
5.  [ ] **Run Locally**: `npm run dev`
6.  [ ] **Build for Production**: `npm run build`
