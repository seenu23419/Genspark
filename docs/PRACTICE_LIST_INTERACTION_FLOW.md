# Practice List Page - Complete Interaction Model

## Overview
This document describes the complete user experience flow, component behaviors, and state management for the Practice List page of the coding learning app.

---

## USER JOURNEY MAP

### 1. Initial Landing (App Startup)

**User Action:** Opens app, navigates to Practice section

**What Happens:**
```
App loads
  ↓
localStorage('practice_progress') is read
  ↓
Progress state is hydrated (if exists)
  ↓
Practice List renders with correct visual states
  ↓
User sees:
  - Topic tabs (sticky at top)
  - Header: "Introduction" + "Pick a problem..." + "0 / 2 completed"
  - Problem cards with visual states (gray, blue, or green bars)
```

**Visual Result:**
- Completed problems: Green bar + checkmark + dimmed styling
- In-progress problems: Blue bar + "In Progress" badge
- Not-started problems: Gray bar + "Not Started" badge
- All buttons are appropriate for each state

---

### 2. Starting a New Problem (NOT STARTED → CodingWorkspace)

**User Action:** Clicks "Start Coding" button on a NOT_STARTED card

**Flow:**
```
User clicks "Start Coding" button
  ↓
Problem card onClick prevents default
  ↓
setSelectedProblem(problem) is called
  ↓
PracticeHub detects selectedProblem is not null
  ↓
CodingWorkspace component renders with:
  - problem data
  - status='NOT_STARTED'
  - onBack, onComplete, onNext callbacks
  ↓
User sees:
  - Top bar: Back button, problem title, "Not Started" badge
  - Left panel: Problem statement, hint button, concept/difficulty
  - Right panel: Code editor with initialCode pre-filled
  - Bottom bar: Reset, Submit buttons
```

**Component Details:**
```tsx
// PracticeHub → CodingWorkspace
<CodingWorkspace
  problem={selectedProblem}
  status="NOT_STARTED"
  onBack={() => setSelectedProblem(null)}
  onComplete={(problemId) => updateProgress(problemId, true)}
  onNext={() => setSelectedProblem(nextProblem)}
/>
```

**Code Editor State:**
- Language: C (for practice problems)
- Code: Populated from `problem.initialCode`
- Test cases: From `problem.testcases`
- Execution environment: Judge0 API

---

### 3. Solving a Problem (CodingWorkspace → Success)

**User Action:** Writes code, clicks "Submit" button

**Flow:**
```
User clicks "Submit"
  ↓
Compiler receives code submission
  ↓
Code is sent to Judge0 for execution
  ↓
Judge0 runs against all test cases
  ↓
If ALL test cases pass:
  ↓ (200ms delay for visual feedback)
  handleRunResult({ accepted: true, ... })
  ↓
  setShowSuccess(true)
  ↓
  onComplete(problemId) is called
  ↓
  Back in PracticeHub:
    progress.solved[problemId] = {
      solvedAt: Date.now(),
      lastAccepted: true,
      attempts: prevAttempts + 1
    }
  ↓
  localStorage is updated
  ↓
Success overlay appears with:
  - ✓ Checkmark icon (animated)
  - "Problem Completed!" heading
  - Execution stats (time, memory)
  - "Back to Practice" button
  - "Next Problem" button (if available)
```

**Success Overlay Design:**
```
┌─────────────────────────────────┐
│                                 │
│           ✓ (animated)          │
│                                 │
│     Problem Completed!          │
│   Great work! You've solved     │
│   this problem successfully.    │
│                                 │
│  Time: 45ms    Memory: 2.3MB    │
│                                 │
│  [Back to Practice] [Next →]    │
│                                 │
└─────────────────────────────────┘
```

**Data Updated:**
- ✅ `progress.solved[problemId].lastAccepted = true`
- ✅ `progress.solved[problemId].solvedAt = Date.now()`
- ✅ `progress.solved[problemId].attempts += 1`
- ✅ `localStorage('practice_progress')` saved

---

### 4. Returning to Practice List (CodingWorkspace → PracticeHub)

**User Action:** Clicks "Back to Practice" button on success overlay

**Flow:**
```
User clicks "Back to Practice"
  ↓
setShowSuccess(false)
  ↓
onBack() callback is triggered
  ↓
setSelectedProblem(null) is called
  ↓
PracticeHub renders the list view again
  ↓
The just-completed problem's card renders with:
  - Green left accent bar
  - "Completed ✓" badge (top-right)
  - Checkmark icon next to title
  - Dimmed title text (slate-400)
  - "Completed" button (disabled, muted)
  - Dimmed concept tag
  ↓
Progress counter updates:
  - Before: "0 / 2 completed"
  - After: "1 / 2 completed"
  ↓
User feels: Accomplished, can see momentum
```

**Card Transformation Example:**

Before submission:
```
┌─────────────────────────────────┐
│ [Not Started] (top-right)       │
│ Easy | Add Two Numbers          │
│      Arithmetic                 │
│ [Start Coding →]                │
└─────────────────────────────────┘
```

After completion (same card):
```
┌─────────────────────────────────┐
│ [Completed ✓] (top-right, green)│
│ Easy | ✓ Add Two Numbers        │
│      Arithmetic                 │
│ [✓ Completed] (disabled)        │
└─────────────────────────────────┘
```

---

### 5. Advancing to Next Problem (Optional Flow)

**User Action:** Clicks "Next Problem" on success overlay (if available)

**Flow:**
```
User clicks "Next Problem →"
  ↓
onNext() is called in CodingWorkspace
  ↓
getNextProblemAdaptive(currentProblemId) is called
  ↓
Returns next problem based on:
  - Recent accuracy (80%+ → harder problems)
  - Unresolved problems in topic
  - Problem difficulty distribution
  ↓
setSelectedProblem(nextProblem) is called
  ↓
CodingWorkspace immediately re-renders with:
  - New problem data
  - Status='NOT_STARTED' (for new problem)
  - Fresh code editor
  - Success overlay closes
  ↓
User sees new problem, ready to solve
  ↓
The previous completed problem card automatically updated in background
```

**Adaptive Selection Logic:**
```typescript
const accuracy = getRecentAccuracy(topicId);
if (accuracy >= 0.8) target = 'hard';      // High accuracy → challenge
else if (accuracy <= 0.4) target = 'easy'; // Low accuracy → basic
else target = 'medium';                    // Default

const nextProblem = topic.problems.find(
  p => p.difficulty === target && !p.lastAccepted && p.id !== currentId
);
```

---

### 6. Resuming an In-Progress Problem

**User Action:** Clicks "Continue" button on an IN_PROGRESS card

**Flow:**
```
User clicks "Continue" button on blue-barred card
  ↓
setSelectedProblem(problem) is called
  ↓
CodingWorkspace renders with:
  - problem data
  - status='IN_PROGRESS'
  - "● In Progress" badge (blue, animated dot)
  ↓
Code editor pre-filled with:
  - Latest code from previous attempt (if stored)
  - OR initialCode if no previous attempt saved
  ↓
User can:
  - Review code
  - Make improvements
  - Submit again
  ↓
If solution is now correct:
  - Same success flow as step 3
  - Problem transitions to COMPLETED state
```

**Status Badge in CodingWorkspace:**
```
[● In Progress] - Blue badge, animated pulsing dot
```

---

### 7. Reviewing a Completed Problem

**User Action:** Clicks on a completed problem (green-barred) card

**Flow:**
```
User clicks on completed problem card
  ↓
Card is clickable (onClick still works)
  ↓
CodingWorkspace renders with:
  - problem data
  - status='COMPLETED'
  - "✓ Completed" badge (green, with checkmark)
  ↓
Code editor loads with:
  - Last submitted solution
  - Read-only mode (optional)
  ↓
User can:
  - Review their solution
  - Read problem statement again
  - View the hint they used
  ↓
Button states:
  - "Reset" → Always available
  - "Submit" → Disabled or gray (can't re-submit solved problem)
```

**Note:** Even though problem is completed, user can still click to review and potentially improve solution if desired.

---

## STATE MACHINE

### Problem State Transitions

```
        START
          ↓
     ┌────────────┐
     │ NOT_STARTED│  (gray bar, "Start Coding" button)
     └────┬───────┘
          │ user clicks "Start Coding"
          ↓
     ┌────────────┐
     │IN_PROGRESS │  (blue bar, "Continue" button, animated dot)
     └────┬───────┘
          │ user submits code
          ├─ code fails → stays IN_PROGRESS
          │
          └─ code passes → transitions to COMPLETED
             (200ms delay, success overlay shown)
                    ↓
            ┌──────────────┐
            │  COMPLETED   │  (green bar, "Completed" button, disabled)
            │              │  (checkmark icon, dimmed styling)
            └──────────────┘
                    ↓
            (user can still click to review)
            (button is disabled, no "submit" action)
```

### State Data Structure

```typescript
type ProgressState = {
  solved: Record<string, {
    solvedAt: number;           // timestamp of completion
    attempts: number;           // total attempts (failed + passed)
    lastAccepted?: boolean;     // true if most recent submission passed
  }>;
};

// Examples:
solved: {
  'p1': { solvedAt: 1705104923000, attempts: 2, lastAccepted: true },     // COMPLETED
  'p2': { solvedAt: 1705104700000, attempts: 5, lastAccepted: false },   // IN_PROGRESS
  // 'p3' not in object → NOT_STARTED
}

// Derived states:
const isSolved = solved[id]?.lastAccepted === true;
const isInProgress = solved[id] && !isSolved;
const isNotStarted = !solved[id];
```

---

## COMPONENT RESPONSIBILITY MATRIX

| Component | Responsibility | Input Props | Output Callbacks |
|-----------|-----------------|-------------|------------------|
| **PracticeHub** | List view, state mgmt, navigation | None | Internal state only |
| **CodingWorkspace** | Problem workspace layout | problem, status, onBack, onComplete, onNext | Calls callbacks on actions |
| **Compiler** | Code editor, execution | initialCode, testcases, onRun | Calls onRun with results |
| **Judge0 API** | Code execution/validation | code, language, testcases | Returns pass/fail result |
| **localStorage** | Persistence | progress state | Loads/saves progress |

---

## INTERACTION RULES

### Card Click Behavior
- **NOT_STARTED card:** Clicking anywhere opens CodingWorkspace
- **IN_PROGRESS card:** Clicking anywhere opens CodingWorkspace
- **COMPLETED card:** Clicking anywhere opens CodingWorkspace (read-only mode)

### Button Click Behavior
- **"Start Coding" button:** Opens CodingWorkspace (problem not started yet)
- **"Continue" button:** Opens CodingWorkspace (resume previous attempt)
- **"Completed" button:** Does nothing (disabled, `onClick={null}`)

### Progress Counter
- Updates immediately after user returns from completed problem
- Counts problems where `lastAccepted === true`
- Formula: `completedCount / totalCount`
- Example: "1 / 5 completed" → "2 / 5 completed"

### Status Badges (Topic Tabs)
- User can switch topics anytime
- Topic state is saved (doesn't reset on revisit)
- Progress is per-topic (each topic has independent progress)

---

## ERROR HANDLING

### Code Submission Fails (Test Case Failed)
```
Judge0 returns: { status.id: 4 } (Wrong Answer)
  ↓
handleRunResult({ accepted: false })
  ↓
Problem remains IN_PROGRESS
  ↓
Error message shown in editor output
  ↓
User can modify code and resubmit
  ↓
No card state change
```

### Code Submission Succeeds (All Tests Pass)
```
Judge0 returns: { status.id: 3 } (Accepted)
  ↓
handleRunResult({ accepted: true })
  ↓
Success overlay shown (200ms delay)
  ↓
onComplete() updates progress state
  ↓
Card transitions to COMPLETED immediately
  ↓
User clicks "Back to Practice"
  ↓
List view shows updated card state
```

### Network Error
```
Judge0 request times out or fails
  ↓
Compiler catches error
  ↓
Error message: "Failed to execute code. Please try again."
  ↓
No progress update
  ↓
Problem remains in previous state
  ↓
User can retry submission
```

---

## PERFORMANCE CONSIDERATIONS

### Rendering Optimization
- Cards only re-render when `progress` state changes
- `progress` is memoized via `useMemo`
- List view is virtualized (only visible cards render)
- CodingWorkspace renders in separate component (no full-list re-render)

### Data Persistence
- localStorage writes are debounced (write on completion only)
- Not on every keystroke or minor state change
- Hydration happens once on app load

### Memory
- Only loaded problems stored in state (not all problems in database)
- Progress object is flat (O(n) where n = problem count in topic)
- No nested arrays or complex structures

---

## ACCESSIBILITY

### Color Contrast
- ✅ Emerald (`bg-emerald-500`) on dark background has 7:1 contrast
- ✅ Blue (`bg-blue-500`) on dark background has 6:1 contrast
- ✅ Gray (`bg-slate-500/40`) is supplementary (not sole indicator)

### Screen Reader Support
- ✅ Status badges include text labels (not icon-only)
- ✅ Buttons have `aria-label` for context
- ✅ Disabled buttons use `disabled` attribute (not just CSS)
- ✅ Icons paired with text (not standalone)

### Keyboard Navigation
- ✅ Tab through cards and buttons
- ✅ Enter/Space to click buttons
- ✅ Proper focus states (browser defaults)

### Touch Targets
- ✅ Buttons: 48px minimum height (py-3 = 12px × 2 + 24px font)
- ✅ Cards: Full width, easy to tap
- ✅ Status badges: Large enough to distinguish

---

## FUTURE ENHANCEMENTS (Out of Scope)

- [ ] Difficulty-based filtering
- [ ] Search by problem title
- [ ] Save code progress during solving
- [ ] Estimate time to solve
- [ ] Show hints without opening workspace
- [ ] Discussion threads
- [ ] Compare solution with others
- [ ] Syntax highlighting improvements
- [ ] Dark mode (already dark, could add light mode)
- [ ] Analytics (problems attempted, time spent, etc.)

---

## SUMMARY

The Practice List page provides:

1. **Clarity:** Three visual states instantly communicate problem status
2. **Confidence:** Progress counter and completion feedback build momentum
3. **Simplicity:** No complexity, no distractions, no gamification
4. **Persistence:** Progress survives app restart
5. **Adaptivity:** Suggests next problem based on accuracy
6. **Accessibility:** Works with keyboard and screen readers
7. **Mobile-first:** Full-width, touch-friendly interface

Users can clearly see what's done, what's in progress, and what's next—without any pressure or distraction.
