# Learning App Philosophy & Design Prompt

## CORE MISSION

**Build a clean, distraction-free learning platform where users learn by fixing their own mistakes.**

This app follows a strict **"AI as Mentor, not Solver"** philosophy.

---

## GLOBAL RULES (NON-NEGOTIABLE)

### ❌ PROHIBITED
- ❌ XP points
- ❌ Streaks
- ❌ Badges
- ❌ Rewards
- ❌ Gamification of any kind
- ❌ Leaderboards
- ❌ Achievements

### ✅ ALLOWED
- ✅ Learning progress tracking
- ✅ Problem completion status
- ✅ Clear visual feedback
- ✅ Educational rewards (conceptual understanding only)

### 🌍 LANGUAGE-AGNOSTIC
The app must work the SAME WAY for:
- C
- C++
- Java
- Python
- JavaScript
- SQL
- HTML/CSS
- Any language added in future

No language-specific shortcuts. No special handling. Same UI, same logic.

---

## PRACTICE LIST PAGE

### Visual Design
- **Cards:** Large, full-width (mobile-first)
- **Layout:** One problem per card, clear spacing
- **Information Hierarchy:** Difficulty → Concept → Status

### What Each Card Shows
```
┌─────────────────────────────────────┐
│ Problem Title                       │
│                                     │
│ Difficulty: Easy | Medium | Hard    │
│ Concept: printf() / loops / etc     │
│ Status: NOT STARTED / IN PROGRESS / │
│         COMPLETED                   │
└─────────────────────────────────────┘
```

### What Cards DON'T Show
- ❌ Full problem statement
- ❌ Code snippets
- ❌ Solution hints
- ❌ XP value
- ❌ Difficulty star ratings
- ❌ User performance data

### Interaction Rules
1. **No Locked Problems**
   - Users can select ANY problem from ANY concept
   - No prerequisites
   - No forced order

2. **Progress Tracking**
   - Show at section level: "Introduction – 1 / 5 completed"
   - Count only COMPLETED status
   - Update in real-time when problem is solved

3. **Status Badges**
   - **NOT STARTED** = Gray pill, no icon
   - **IN PROGRESS** = Blue pill, pulsing dot
   - **COMPLETED** = Green pill, checkmark icon

---

## PROBLEM SOLVING PAGE (After Opening)

### Page Layout (Top to Bottom)

```
┌─────────────────────────────────────────┐
│ [Back]  Problem Title   [Status Badge]  │  ← Top Bar
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│                                         │
│  Problem Description Section            │
│  - Full statement                       │
│  - Clear requirements                   │
│  - Examples (text only)                 │
│                                         │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│                                         │
│  Code Editor Section                    │
│  - Starter code template                │
│  - Line numbers                         │
│  - Syntax highlighting                  │
│  - Reset button                         │
│                                         │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  Error Panel (only if error exists)     │
│  - Language name                        │
│  - Line number                          │
│  - Error message                        │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│                                         │
│  AI Explanation Panel                   │
│  - Why the error occurs                 │
│  - What concept is violated             │
│  - How to think about fixing it         │
│                                         │
└─────────────────────────────────────────┘

[Run Code]  [Submit Solution]  [Reset Code]
```

---

## CODE EDITOR BEHAVIOR

### Starter Code
- **Provide:** Basic template only
- **Don't Provide:**
  - Complete solution
  - Full function implementations
  - All edge case handling

### Copy-Paste Prevention
- ❌ Disable copy-paste from AI responses
- ❌ Disable copy-paste from hint sections
- ✅ Allow copy-paste between editor and external resources
- ✅ Allow paste from problem description into editor

### Reset Feature
- **Functionality:** Return to original starter code
- **Location:** Button in action bar
- **Behavior:** Confirm dialog before reset
- **Result:** Clear editor, erase user's attempts, restart fresh

---

## ERROR HANDLING (CRITICAL)

### When an Error Occurs

#### Step 1: Show Error Panel
```
┌──────────────────────────────┐
│ ERROR: Compilation Failed     │
│                              │
│ Language: C                  │
│ Line: 5                      │
│                              │
│ error: missing ';' before    │
│        '}' token             │
└──────────────────────────────┘
```

#### Step 2: DO NOT (AI Rules)
- ❌ Modify or rewrite user's code
- ❌ Provide full corrected code
- ❌ Give copy-paste answers
- ❌ Auto-fix anything
- ❌ Show complete solution

#### Step 3: DO (AI Explanation Panel)

Explain ONLY these four things:

1. **WHICH LINE has the error**
   - "The error is on line 5"
   - Point directly to the problem

2. **WHY the error occurs in this language**
   - "In C, every statement must end with a semicolon"
   - Language-specific rule
   - Not generic advice

3. **WHAT CONCEPT is violated**
   - "This relates to C syntax rules"
   - "Specifically: statement termination"
   - Educational framing

4. **HOW the user should think to fix it**
   - "Think: what is C expecting after this line?"
   - "Where should the semicolon go?"
   - Guide thinking, not the solution

### Example AI Explanation Tone

❌ **WRONG:**
```
You forgot a semicolon. Add a semicolon after the closing brace 
on line 5. Your code should be:
}; ← Add this
```

✅ **RIGHT:**
```
The error on line 5 is "missing ';' before '}' token". In C, 
every statement and closing brace that ends a scope needs a 
semicolon. Think about what C is expecting at the end of this 
line. Where should the terminator go?
```

### Output Style (Plain Text)
- No code blocks
- No copy buttons
- No highlighted solutions
- No syntax highlighting in explanation
- Plain readable text only

---

## SUCCESS STATE

### When Code Runs Successfully

#### Display
```
┌─────────────────────────────┐
│                             │
│  ✓ SUCCESS                  │
│                             │
│  You fixed this problem     │
│  yourself. Well done.       │
│                             │
│  [Mark as Completed]        │
│  [Go Back to Problems]      │
│                             │
└─────────────────────────────┘
```

#### Backend Updates
1. Mark problem status as COMPLETED
2. Record completion timestamp
3. Update progress count
4. Save to user's profile

#### Return to Practice List
- Show COMPLETED badge on problem card
- Update section progress: "1 / 5 completed" → "2 / 5 completed"
- Problem card shows green status pill with checkmark

---

## AI ROLE (UNIVERSAL FOR ALL LANGUAGES)

### You are a Coding Mentor

You are NOT:
- A code generator
- A shortcut tool
- An auto-fixer
- A homework solver
- A copy-paste provider

You ARE:
- A teacher
- A guide
- An explainer
- A concept clarifier
- A thought-process helper

### What You Do

| Task | How |
|------|-----|
| Error occurs | Explain the error, not the fix |
| User is stuck | Ask clarifying questions about their thinking |
| Concept unclear | Explain the concept, show examples in plain text |
| Need help | Point to learning resources, not solutions |
| Ready to retry | Encourage and remind of key concept |

### What You Don't Do

| Don't | Why |
|------|-----|
| Give code snippets | Users must write themselves |
| Auto-complete | Defeats learning objective |
| Skip to solution | Users bypass problem-solving |
| Rewrite code | Takes learning away from user |
| Provide shortcuts | Undermines understanding |

---

## DESIGN PRINCIPLES

### Visual Design
- **Clean:** Minimal UI, no distractions
- **Minimal:** Only necessary elements visible
- **Educational:** Visual hierarchy supports learning
- **Mobile-first:** Works perfectly on phones first
- **Dark theme:** Easy on eyes, modern aesthetic

### Information Architecture
- **Clear separation** between:
  - Code (what user writes)
  - Errors (what went wrong)
  - Explanation (how to think)
- **No mixing** of concerns
- **Each panel has one job**

### User Experience
- **Progress is visible** but not gamified
- **Errors are clear** but not intimidating
- **Explanations are helpful** but not spoon-feeding
- **Success is celebrated** but not over-rewarded

---

## IMPLEMENTATION CHECKLIST

### Practice List Page
- [ ] Full-width cards (mobile-first)
- [ ] Difficulty badges (Easy / Medium / Hard)
- [ ] Concept tags displayed
- [ ] Status badges (3 states: NOT STARTED / IN PROGRESS / COMPLETED)
- [ ] No problem statement in cards
- [ ] Section-level progress counter ("X / N completed")
- [ ] No locked problems
- [ ] No gamification elements

### Problem Solving Page
- [ ] Top bar: Back + Title + Status
- [ ] Problem description section (full statement)
- [ ] Code editor with starter template
- [ ] Error panel (only when error exists)
- [ ] AI explanation panel
- [ ] Action bar: Run / Submit / Reset buttons
- [ ] Success overlay (no XP/rewards)

### Code Editor
- [ ] Starter code provided (not full solution)
- [ ] Reset button functional
- [ ] Copy-paste disabled from AI responses
- [ ] Line numbers visible
- [ ] Syntax highlighting enabled

### Error Handling
- [ ] Error panel shows language, line, message
- [ ] AI explanation follows 4-point rule
- [ ] No code provided in explanation
- [ ] Mentoring tone (guiding, not solving)
- [ ] Plain text output only

### Success State
- [ ] Success message displayed
- [ ] Mark as Completed button works
- [ ] Go Back button returns to list
- [ ] Status updated on practice list
- [ ] Progress counter updated

### Language Support
- [ ] C working
- [ ] C++ working
- [ ] Java working
- [ ] Python working
- [ ] JavaScript working
- [ ] Same UI for all languages
- [ ] Language-specific error messages accurate

### Gamification Audit
- [ ] No XP system
- [ ] No streaks
- [ ] No badges
- [ ] No achievements
- [ ] No leaderboards
- [ ] No points/scoring
- [ ] No notifications for "milestones"

---

## FINAL OBJECTIVE

Users should learn to:
1. ✅ **Read errors** - Understand error messages
2. ✅ **Understand mistakes** - Know why code failed
3. ✅ **Fix code themselves** - Write the solution
4. ✅ **Build real problem-solving skills** - Think independently

This app is a **learning platform**, not a **shortcut tool**.

---

## Quick Reference Table

| Area | Do ✅ | Don't ❌ |
|------|------|--------|
| **Starter Code** | Provide template | Give solution |
| **Errors** | Explain why | Provide fix |
| **Hints** | Guide thinking | Copy-paste help |
| **UI** | Clean, minimal | Gamified, flashy |
| **Feedback** | Conceptual | Rewarding |
| **Language** | Consistent all | Special handling |
| **Copy-Paste** | External sources | AI responses |
| **Success** | Celebrate learning | Award points |

---

## Files to Review/Update

### Core Components
- `screens/practice/PracticeHub.tsx` - Practice list
- `screens/practice/CodingWorkspace.tsx` - Problem solving
- `screens/compiler/Compiler.tsx` - Code editor

### Supporting
- `components/ErrorBoundary.tsx`
- `services/authService.ts`
- `data/practiceProblems.ts`

### Remove/Audit
- Gamification systems
- XP tracking
- Streak counters
- Badge systems
- Achievement systems

---

## Version History

- **v1.0** - Initial philosophy & design prompt (Jan 14, 2026)
- **Implementation Target** - Ready for phase-by-phase rollout

