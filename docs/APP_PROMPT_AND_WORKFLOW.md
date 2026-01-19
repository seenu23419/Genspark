# GenSpark Learning Platform - Complete App Prompt & Workflow

## 🎯 App Overview

**GenSpark** is a modern, interactive web-based learning platform designed to help users master programming languages and full-stack development through structured, hands-on learning paths. The platform combines curriculum progression, code execution, real-time feedback, and gamification elements.

---

## 🏗️ Technology Stack

- **Frontend**: React 19 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router v6
- **State Management**: React Context (AuthContext, CurriculumContext)
- **Backend/Auth**: Supabase (PostgreSQL + Auth)
- **Code Execution**: Judge0 API (remote code compiler)
- **Payment**: Razorpay
- **Notifications**: Sentry (error tracking)
- **Real-time Chat**: Gemini AI integration (ChatService)
- **Offline Support**: Service Workers + IndexedDB
- **Testing**: Jest + React Testing Library

---

## 📱 App Structure

```
screens/
├── auth/
│   ├── Splash.tsx (3-second branded splash screen with pulsing animation)
│   ├── Login.tsx (Email/Google OAuth login)
│   ├── Signup.tsx (User registration with email verification)
│   └── Onboarding.tsx ("Tell us about yourself" form - h-16 button, auto-focus)
├── home/
│   └── Home.tsx (Dashboard with Continue Learning card + Study Goals + Goal Analytics)
├── learn/
│   └── LearnHub.tsx (Learning Paths - course cards with "Get Started"/"Continue" CTAs)
├── lessons/
│   ├── LessonsList.tsx (Shows all lessons in a language with progress tracking)
│   └── LessonView.tsx (Individual lesson view with markdown content + code executor)
├── practice/
│   └── PracticeHub.tsx (Code challenges with real-time execution feedback)
├── profile/
│   ├── Profile.tsx (User stats: XP, streak, certificates)
│   └── Settings.tsx (Preferences, notifications, about)
├── quiz/
│   └── Quiz.tsx (Assessment after lessons)
├── challenges/
│   └── Challenges.tsx (Problem sets with difficulty levels)
├── admin/
│   └── Dashboard.tsx (Admin panel for user management)
├── subscription/
│   └── Subscription.tsx (Pro tier features and pricing)
└── chat/
    └── Chat.tsx (AI-powered learning assistant via Gemini)

components/
├── Layout.tsx (Sidebar + mobile nav with GenSpark logo)
├── ErrorBoundary.tsx (Error handling)
├── OfflineBanner.tsx (Offline mode indicator)
├── PremiumGuard.tsx (Paywall for pro features)
├── gamification/
│   ├── LearningProgressCard.tsx (Continue Learning card - clickable, 28x28 circle, outcome-focused)
│   ├── StudyGoals.tsx (Goals tracker with +1/-1 progress buttons)
│   ├── GoalAnalytics.tsx (Stats with friendly "no goals" placeholder)
│   ├── StudyGoals.tsx (Goals with simplified actions)
│   └── DailyChallenge.tsx (Removed from home page)
├── social/
│   └── MicroStat.tsx (Removed "143 coding now" tag from home)
├── compiler/
│   ├── InlineCompiler.tsx (Small code runner for lessons)
│   └── CodePlayground.tsx (Full playground for practice)
└── ...other components

data/
├── pythonCurriculum.ts
├── javascriptCurriculum.ts
├── htmlcssCurriculum.ts
├── javaCurriculum.ts
├── cppCurriculum.ts
├── cCurriculum.ts
├── sqlCurriculum.ts
├── dsaCurriculum.ts
├── fullstackCurriculum.ts
└── practiceProblems.ts

services/
├── authService.ts (Supabase Auth)
├── compilerService.ts (Judge0 integration)
├── mongodbService.ts (Database operations)
├── curriculumService.ts (Lesson data management)
├── certificateService.ts (Certificate generation)
├── paymentService.ts (Razorpay integration)
├── chatService.ts (Gemini AI)
├── offlineService.ts (Offline caching)
└── supabaseService.ts (Database queries)

contexts/
├── AuthContext.tsx (User auth state + profile)
└── CurriculumContext.tsx (Lesson/curriculum data)

public/
└── logo.png (GenSpark logo - 60x60 on splash, 8-20 in navbar)
```

---

## 🔐 Authentication Flow

### User Registration & Onboarding
1. User opens app → **Splash Screen** (3-second pulsing dot animation)
2. After splash: **Login/Signup** page
3. User can:
   - Sign up with email + password
   - Login with email + password
   - Login with Google OAuth (detects via URL params, skips splash)
4. On first login → **Onboarding Screen** ("Tell us about yourself")
   - Collect first name (required, auto-focus), last name (optional)
   - "Start Learning" button (h-16, disabled until first name entered)
   - Removed "Powered by GenSpark AI" tag
5. After onboarding → **Home Dashboard**

### OAuth Flow
- Google login triggers redirect with `access_token` or `code` in URL
- ProtectedRoute detects OAuth params and skips splash timer
- No page flashing (splash → login → onboarding all prevented)
- Proper sequencing: OAuth redirect → Auth loads → Home shows

---

## 🏠 Home Dashboard Workflow

### Layout
```
┌─────────────────────────────────────┐
│  Hi, [User] 👋        [Pro Button]  │
│  Your learning journey continues    │
├─────────────────────────────────────┤
│  Continue Learning Card             │  ← Fully clickable, shows:
│  [Icon] C Python Fundamentals       │    - Language icon
│  Pick up where you left off →       │    - Current lesson title
│  [Progress Circle] 45%              │    - Outcome-focused subtitle
│                                     │    - Large 28x28 progress circle
├─────────────────────────────────────┤
│  Study Goals Box                    │  ← Separate box
│  • Goal 1: 7/10 lessons [Progress]  │    - Goal cards with:
│  • Goal 2: 18/30 days [+1 button]   │      · Icon + title
│  • Goal 3: 8/20 problems [−  +1]    │      · +1/-1 progress (simplified)
│                                     │      · No delete button
├─────────────────────────────────────┤
│  Goal Analytics Box                 │  ← Separate box
│  • Total: 3                         │    - Friendly "no goals" placeholder
│  • Done: 1                          │    - Shows stats if goals exist
│  • Active: 2                        │
└─────────────────────────────────────┘
```

### Key Features
- **Continue Learning**: Click anywhere to open the lesson (single action)
  - Hover: border highlights, shadow glow, text color change
  - Shows progress circle on right side (28x28, large)
  - Removed "Continue Learning" button (now full card is clickable)
  
- **Study Goals**: 
  - Removed delete button (clutter)
  - Kept +1/-1 progress buttons (essential)
  - Shows progress bar
  - Simplified layout
  
- **Goal Analytics**:
  - Empty state: "No goals yet - Create your first goal to see your progress"
  - Shows: Total, Done (completed), Active, Time spent
  - Friendly placeholder with icon and message

---

## 📚 Learning Paths Screen

### Course Card Layout
```
┌──────────────────────────┐
│ [Icon]            [Badge]│  ← Icon on left, "New" or level badge on right
├──────────────────────────┤
│ Python                   │  ← Course name (outcome-focused)
│ Start learning today     │  ← Dynamic subtitle (outcome, not structure)
├──────────────────────────┤
│ [Progress bar if exists] │  ← Shows "New" indicator for 0% progress
│ or "Starts with:..."     │  ← Shows starting point for new users
├──────────────────────────┤
│ Lessons: 24  Hours: 12h  │  ← Quick stats (cleaner layout)
│ Done: — (or 45%)         │
├──────────────────────────┤
│ Get Started →            │  ← Single clear action (footer indicator)
│ (or "Continue →")        │    - Chevron animates on hover
└──────────────────────────┘
```

### Workflow
1. User clicks **Learning Paths** from Learn screen
2. See grid of language cards (Python, JavaScript, Java, C++, etc.)
3. For each card:
   - **New users (0% progress)**: See "New" badge + "Starts with: Core Fundamentals" box
   - **Returning users**: See progress bar + "Continue" indicator
4. Click card → Navigate to **Lessons List** for that language
5. See all lessons with unlock status, completion status
6. Click lesson → **LessonView** to start learning

### Removed Elements
- ❌ Delete/management buttons
- ❌ "5 Levels" badge (structure, not outcome)
- ❌ Three-segment roadmap visualization
- ❌ Verbose level labels (Beginner/Intermediate/Advanced)

---

## 📖 Lesson Learning Workflow

### LessonsList Component
```
Language: Python
Module 1: Core Fundamentals
  ☐ Lesson 1: Variables & Data Types
  ☐ Lesson 2: String Operations
  ✓ Lesson 3: Control Flow (completed)
  🔒 Lesson 4: Functions (locked)
Module 2: Object-Oriented Programming
  🔒 All lessons locked
```

Features:
- Shows all modules and lessons
- Unlock status, completion status
- Progress bar at top
- Search/filter by lesson name
- Click lesson → LessonView

### LessonView Component
```
Python > Variables & Data Types

[Content]
- Markdown-rendered lesson content
- Code examples with syntax highlighting
- Interactive code playground (if needed)
- Inline compiler for quick tests

[Progress]
- "Lesson 1 of 10" indicator
- Mark as complete button
- Next lesson button

[Navigation]
- Back to lessons list
- Previous/next lesson
- Jump to quiz
```

Features:
- Full lesson content (markdown support)
- Code execution via Judge0
- Syntax highlighting (Prism)
- Completion tracking
- Quiz trigger
- Confetti on completion
- Offline support

---

## 💻 Code Execution (Practice/Challenges)

### PracticeHub Component
```
Problem: Sum of Array
Difficulty: Easy | Time: 15 mins

[Code Editor]
def sum_array(arr):
    # Write your code here
    pass

[Test Output]
✓ Test 1 passed
✓ Test 2 passed
✗ Test 3 failed
  Expected: 15, Got: 0

[Progress]
Streak: 5 🔥 | XP: +50 | Attempt: 1/3
```

Workflow:
1. User selects problem from PracticeHub
2. See problem statement + starter code
3. Write solution in editor
4. Click "Run Tests" or "Submit"
5. Judge0 executes code against test cases
6. Real-time feedback:
   - ✓ All tests pass → XP awarded, streak increases, next problem button
   - ✗ Tests fail → Error details, allow retry
7. Track progress: streak, XP, badges

---

## 🎮 Gamification Elements

### Current System
- **XP**: Earned per lesson completed, problem solved
- **Streak**: Daily learning consistency (in profile, not on home)
- **Badges**: Milestone achievements
- **Certificates**: Course completion proof
- **Progress Circles**: Visual motivation for course progress

### Removed Elements (Clutter Reduction)
- ❌ "143 coding now" stat from home (MicroStat)
- ❌ Daily Challenge/Streak box from home
- ❌ "Powered by GenSpark AI" tag
- ❌ Redundant badges and animations

---

## 👤 User Profile

### Stats Display
```
Level 5 Learner

XP: 1,250 ━━━━━━━━━━ Next: 1,500
Streak: 7 Days 🔥
Certificates: 3 📜

Achievements:
• Certified Python Dev
• 100 Problems Solved
• Week Warrior (7-day streak)
```

Features:
- Badges earned
- Certificate management
- Learning statistics
- Goal history

---

## 🔧 Settings & Preferences

### User Settings
- Account info (name, email)
- Notifications (daily reminders, streak notifications)
- Theme preferences
- Privacy settings
- App version info

---

## 💳 Subscription (Pro Features)

### Free Tier
- Access to all lessons
- Basic practice problems
- Community features

### Pro Tier
- Advanced challenges
- Code execution unlocked
- Certificate generation
- AI chat assistant
- Ad-free experience

### Payment Flow
1. User clicks "Pro" button
2. See pricing details via Razorpay modal
3. Process payment
4. Update user.is_pro flag
5. Unlock pro features

---

## 🌐 Offline Support

### Features
- Service workers cache lessons
- IndexedDB stores progress locally
- Offline banner shows when disconnected
- Queue submissions for sync when back online

### Flow
1. User downloads lesson while online
2. Service worker caches content
3. User goes offline
4. App shows "Offline Mode" banner
5. Can still browse cached lessons
6. Actions queue locally
7. When back online → sync with backend

---

## 🔄 Complete User Journey

### First-Time User
1. **Day 1**: 
   - App opens → 3-sec splash screen
   - Sign up (email/Google)
   - Onboarding form (first name required)
   - Home dashboard (empty goals, continue learning ready)
   - Click "Continue Learning" → LessonsList
   - Select first lesson → LessonView
   - Read content, run code examples

2. **Day 2**:
   - Login with saved credentials
   - No splash screen (unless new session)
   - Home shows "Continue Learning" with saved progress
   - Click → pick up from last lesson
   - Complete lesson → +50 XP
   - Take quiz → 100% completion
   - See confetti animation

3. **Day 3**:
   - Create a study goal ("Complete Python Basics")
   - Set target: 10 lessons, deadline: 2 weeks
   - Home shows goal progress
   - Practice problems increase streak
   - Goal Analytics updates

### Returning User
1. Login → Home dashboard
2. See progress on all active paths
3. Continue Learning card shows next lesson
4. Study Goals show progress
5. Goal Analytics shows achievement stats
6. Browse other courses
7. Practice problems
8. Check certificates

### Learner Path
- Browse Learning Paths
- Select course (Python for example)
- See lessons list
- Start lesson 1 → read content
- Run code examples inline
- Complete lesson → take quiz
- Move to lesson 2
- After 5+ lessons → eligible for certificate
- View certificate on profile

---

## 🎨 Design System

### Color Palette
- **Primary**: Indigo (`indigo-600`, `indigo-500`)
- **Background**: Dark (`#020617` / `slate-950`)
- **Surface**: Slate (`slate-900`, `slate-800`)
- **Text**: Light (`white`, `slate-400`)
- **Success**: Emerald/Green (`emerald-400`, `green-600`)
- **Alert**: Red/Orange (`red-400`, `orange-400`)

### Typography
- **Headings**: Black font weight (font-black), uppercase tracking
- **Body**: Medium font weight (font-medium), slate colors
- **Small**: Bold font weight (font-bold), xs size

### Components
- **Buttons**: 
  - Primary: `bg-indigo-600 hover:bg-indigo-500`
  - Secondary: `bg-slate-800 hover:bg-slate-700`
  - Disabled: `opacity-50 cursor-not-allowed`
  - Size: `px-3 py-1.5` (small), `px-4 py-2` (medium), `px-6 py-3` (large)

- **Cards**: 
  - Border: `border border-slate-800`
  - Background: `bg-slate-900`
  - Hover: `hover:border-indigo-500/50`
  - Rounded: `rounded-lg` (small), `rounded-2xl` (large)

- **Badges**: 
  - Pill shape: `rounded-full`
  - Padding: `px-3 py-1`
  - Font: `text-xs font-bold uppercase tracking-widest`

---

## 📊 Database Schema (Supabase)

### users
- id (UUID)
- email (string)
- first_name, last_name (string)
- avatar_url (string)
- xp (integer)
- streak (integer)
- is_pro (boolean)
- last_lesson_id, last_language_id (string)
- completed_lesson_ids (array)
- unlocked_lesson_ids (array)
- subscription_tier (string)
- created_at, updated_at (timestamp)

### study_goals
- id (UUID)
- user_id (UUID, FK)
- title (string)
- target, current (integer)
- unit (string: lessons, days, problems)
- deadline (timestamp)
- color_gradient (string)
- icon_type (string)
- completed (boolean)
- created_at, updated_at (timestamp)

### certificates
- id (UUID)
- user_id (UUID, FK)
- language_id (string)
- issue_date (timestamp)
- certificate_url (string)
- verified (boolean)

### submissions
- id (UUID)
- user_id (UUID, FK)
- problem_id (string)
- language (string)
- code (text)
- status (passed/failed)
- test_results (JSON)
- xp_earned (integer)
- submitted_at (timestamp)

---

## 🚀 Key Workflows

### Lesson Completion Workflow
```
LessonView Page
    ↓
User reads content & runs code
    ↓
Click "Mark Complete" button
    ↓
POST to supabaseService.markLessonComplete()
    ↓
Backend updates completed_lesson_ids array
    ↓
Add XP (+50 points typically)
    ↓
Show confetti animation
    ↓
Enable "Next Lesson" button
    ↓
Update home progress circle
```

### Problem Solving Workflow
```
PracticeHub Problem
    ↓
User writes solution in editor
    ↓
Click "Run Tests" or "Submit"
    ↓
POST to compilerService with code + test cases
    ↓
Judge0 API executes code remotely
    ↓
Return test results (pass/fail for each case)
    ↓
Display results to user
    ↓
If all pass:
  - Award XP
  - Mark as solved
  - Increase streak
  - Show next problem
Else:
  - Show error details
  - Allow retry
  - Don't award XP yet
```

### Goal Tracking Workflow
```
StudyGoals Component
    ↓
User clicks "+1 Progress" button on goal
    ↓
Call updateGoal(goalId, newProgress)
    ↓
POST to supabaseService.updateGoal()
    ↓
Backend updates goal.current value
    ↓
Component refreshes goals list
    ↓
Progress bar updates
    ↓
If goal.current >= goal.target:
  - Show "Mark as Completed" button
  - User clicks to mark complete
  - Goal moves to completed list
    ↓
GoalAnalytics updates stats
```

---

## 🐛 Error Handling

### Global Error Boundary
- Catches React component errors
- Shows friendly error message
- "Try Again" button to reload
- Logs to Sentry for monitoring

### Network Errors
- Offline banner when no connection
- Queue actions locally
- Retry when back online
- Fallback to cached data

### Code Execution Errors
- Timeout: "Code took too long"
- Compilation error: Show error message
- Runtime error: Show stack trace
- Empty output: "Code ran but produced no output"

---

## 📱 Responsive Design

### Breakpoints
- **Mobile**: < 640px (sm:)
  - Single column layout
  - Smaller cards and text
  - Bottom navigation bar
  - Hamburger menu
  
- **Tablet**: 640px - 1024px (md:)
  - Two column grid for cards
  - Medium text sizes
  - Sidebar visible
  
- **Desktop**: > 1024px (lg:)
  - Three column grid for cards
  - Full sidebar
  - Max-width containers (max-w-6xl)

### Mobile Optimizations
- Safe-area padding for notches: `env(safe-area-inset-*)`
- Touch-friendly button sizes: 44px minimum
- No hover states on mobile (active states instead)
- Bottom nav for main actions
- Swipeable lesson navigation

---

## 🔒 Security

- **Auth**: Supabase Auth with JWT tokens
- **API Keys**: Judge0, Razorpay stored as env vars
- **Database**: Row-level security policies
- **Offline**: No sensitive data cached locally
- **Payment**: PCI compliant via Razorpay
- **CORS**: Configured for specific domains

---

## 📈 Analytics Events

- User signup/login
- Lesson started/completed
- Quiz submitted
- Problem solved
- Goal created/updated
- Certificate earned
- Subscription purchased
- Code executed
- Time spent per lesson

---

## 🎯 Recent Improvements (Current Session)

1. ✅ Logo added (`public/logo.png`)
2. ✅ Splash screen redesigned (3-sec timer, pulsing dots)
3. ✅ OAuth flow fixed (no page flashing)
4. ✅ Onboarding polished (h-16 button, auto-focus, removed branding tag)
5. ✅ Home dashboard optimized (reduced density, motivational copy)
6. ✅ Continue Learning card fully clickable (single action)
7. ✅ Study Goals simplified (removed delete button)
8. ✅ Goal Analytics with friendly empty state
9. ✅ Learning Paths redesigned (outcome-focused, clear starting points)
10. ✅ MicroStat removed from home ("143 coding now" tag)
11. ✅ Daily Challenge removed from home (reduced gamification noise)
12. ✅ Course cards fully tappable (navigate to lessons list)

---

## 📝 Next Steps / Future Enhancements

- [ ] Mobile bottom navigation (tab bar)
- [ ] Real-time collaboration features
- [ ] AI code review (via Gemini)
- [ ] Community forums/discussions
- [ ] Peer code review system
- [ ] Video lessons integration
- [ ] Live coding sessions
- [ ] Personalized learning paths (AI-based)
- [ ] Mobile app (React Native)
- [ ] Dark/light mode toggle
- [ ] Accessibility improvements (WCAG 2.1 AA)

---

## 🔗 Key Dependencies

```json
{
  "react": "19.x",
  "react-router-dom": "^7.x",
  "typescript": "^5.x",
  "tailwindcss": "^3.x",
  "@supabase/supabase-js": "^2.x",
  "react-markdown": "^9.x",
  "react-syntax-highlighter": "^15.x",
  "lucide-react": "^0.263.x",
  "axios": "^1.x",
  "zustand": "^4.x" (optional state)
}
```

---

## 🚀 Deployment

- **Frontend**: Netlify (auto-deploy on git push)
- **Backend**: Supabase (serverless PostgreSQL)
- **Code Execution**: Judge0 API (cloud)
- **Storage**: Supabase Storage (for certificates, avatars)
- **CDN**: Cloudflare (for assets)

---

This is a complete overview of the GenSpark learning platform. The app is production-ready with a polished UX, clear user workflows, and robust error handling.
