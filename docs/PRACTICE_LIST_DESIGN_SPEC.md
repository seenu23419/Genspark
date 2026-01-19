# Practice List Page - Design Specification & Implementation Guide

## Overview
The Practice List page is a mobile-first, state-aware problem list interface that clearly communicates problem progress and provides context-specific actions. No gamification elements (XP, streaks, badges, locks).

---

## 1. PAGE STRUCTURE

### Header Section
**Location:** Sticky at top of problem list (below topic tabs)
**Content:**
- **Title:** Topic name (e.g., "Introduction")
- **Subtitle:** "Pick a problem and start coding. You can return anytime."
- **Progress Counter:** "X / N completed" (right-aligned)
- **Layout:** Vertical stack on mobile, horizontal on desktop

**Styling:**
```
Title:      text-2xl md:text-3xl font-black text-white
Subtitle:   text-xs md:text-sm text-slate-400
Progress:   text-xs font-semibold text-slate-500
Container:  space-y-2 (vertical gap)
```

---

## 2. VISUAL STATE SYSTEM

Each problem card displays one of three mutually exclusive states:

### State 1: NOT STARTED
**Visual Indicators:**
- **Left Accent Bar:** Gray (`bg-slate-500/40`)
- **Card Background:** `bg-slate-900/30` (normal) → `bg-slate-900/50` (hover)
- **Card Border:** `border-white/10` (normal) → `border-white/20` (hover)
- **Status Badge:** Gray pill with "Not Started" text
- **Title Color:** `text-white` with `group-hover:text-indigo-300`
- **Concept Tag:** `bg-slate-800/60`

**Button:** "Start Coding →" (Primary Indigo)
- Style: `bg-indigo-600 hover:bg-indigo-700`
- Shadow: `shadow-lg shadow-indigo-600/20`
- Icon: ChevronRight (hidden on mobile)

---

### State 2: IN PROGRESS
**Visual Indicators:**
- **Left Accent Bar:** Blue (`bg-blue-500`)
- **Card Background:** `bg-slate-900/40` (normal) → `bg-slate-900/60` (hover)
- **Card Border:** `border-blue-500/30` (normal) → `border-blue-500/50` (hover)
- **Status Badge:** Blue pill with animated dot + "In Progress" text
  - Animated dot: `animate-pulse` (blue-400)
- **Title Color:** `text-white` (same as not started)
- **Concept Tag:** `bg-slate-800/60`
- **"Last opened" Label:** Appears below difficulty badge

**Button:** "Continue →" (Primary Blue)
- Style: `bg-blue-600 hover:bg-blue-700`
- Shadow: `shadow-lg shadow-blue-600/20`
- Icon: ChevronRight (hidden on mobile)
- Same visual weight as "Start Coding" button

---

### State 3: COMPLETED
**Visual Indicators:**
- **Left Accent Bar:** Emerald (`bg-emerald-500`)
- **Card Background:** `bg-slate-900/20` (normal) → `bg-slate-900/30` (hover) — *dimmed*
- **Card Border:** `border-white/5` (normal) → `border-white/10` (hover) — *very subtle*
- **Status Badge:** Green pill with checkmark icon + "Completed ✓" text
  - Icon: `Check` icon in emerald-400
- **Title Color:** `text-slate-400` — *muted/dimmed*
  - Checkmark icon appears to left of title: `text-emerald-500`
  - Icon size: 18px, positioned with `mt-0.5` vertical offset
- **Concept Tag:** `bg-slate-800/40` (dimmed) with `text-slate-500`
- **"Last opened" Label:** Appears below difficulty badge

**Button:** "Completed" (Secondary/Disabled)
- Style: `bg-emerald-600/20 text-emerald-300 border-emerald-500/30`
- Icon: `Check` icon in emerald-300
- **Disabled:** `disabled={true}` (cursor-default, no hover effects)
- **No shadow:** Unlike primary buttons
- Communicates: "This is a completed state, view only"

---

## 3. CARD ANATOMY

### Layout Structure
```
┌─────────────────────────────────────────────────────┐
│ █ [STATUS BADGE TOP-RIGHT]                          │
│█│  [Difficulty]  [Last opened?]                     │
│█│  [Problem Title (2 lines max)] ✓ (if completed)    │
│█│  [Concept Tag]                  [Button]           │
│█│                                                     │
└─────────────────────────────────────────────────────┘

Key:
█ = Left accent bar (1px wide, status color)
█│ = Card content area
```

### Component Order (Top to Bottom)
1. **Difficulty Badge**
   - Easy: `bg-emerald-400/10 border-emerald-400/20 text-emerald-400`
   - Medium: `bg-amber-400/10 border-amber-400/20 text-amber-400`
   - Hard: `bg-rose-400/10 border-rose-400/20 text-rose-400`
   - Size: `px-2.5 py-1 text-[8px] font-bold uppercase tracking-wide border rounded`

2. **"Last opened" Label** (only for IN_PROGRESS and COMPLETED)
   - Text: `text-[7px] font-semibold uppercase text-slate-500`
   - Positioned inline with difficulty badge (flex gap-3)

3. **Problem Title**
   - Size: `text-base sm:text-lg font-black leading-snug`
   - Max lines: 2 (`line-clamp-2`)
   - Icon if completed: Green checkmark to left of title
   - Spacing: `mb-2.5` below
   - Color changes with state (white vs. slate-400)

4. **Concept Tag**
   - Size: `text-[8px] font-medium px-2.5 py-0.5 rounded-full`
   - Text/bg colors change with state
   - Supports multiple tags (flex-wrap with gap-1.5)

5. **CTA Button** (Right side on desktop, full-width on mobile)
   - Mobile: `w-full` at `pt-2`
   - Desktop: `sm:w-auto` at `sm:pt-0`
   - Padding: `px-6 py-3` (touch-friendly)
   - Text: `text-sm font-bold uppercase tracking-wide`
   - Button text varies per state (shown above)

### Responsive Layout
- **Mobile:** Flex column, button below content
- **Desktop:** Flex row, button right-aligned
  - Breakpoint: `sm:` (640px)
  - Container: `flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4`

### Spacing
- **Card Padding:** `p-5 sm:p-6` (5rem on mobile, 6rem on desktop)
- **Content Gap:** `gap-4` between left section and button
- **Internal Gaps:**
  - Difficulty + "Last opened": `gap-3`
  - Title + Concept: `mb-2.5`
  - Concept tags: `gap-1.5`

---

## 4. CTA BUTTON BEHAVIOR MATRIX

| State | Button Text | Style | Icon | Disabled | Action |
|-------|-------------|-------|------|----------|--------|
| NOT_STARTED | "Start Coding →" | Primary Indigo | ChevronRight | ❌ No | Open CodingWorkspace |
| IN_PROGRESS | "Continue →" | Primary Blue | ChevronRight | ❌ No | Resume CodingWorkspace |
| COMPLETED | "Completed ✓" | Secondary Muted | Check | ✅ Yes | View only (card remains clickable) |

**Key Rules:**
- ✅ Each state has **visually distinct button styling** (never same style for all)
- ✅ Completed button is **disabled** but **not cursor-disabled** (gray out, no pointer events)
- ✅ Primary buttons (Start/Continue) have **shadow and hover effects**
- ✅ Completed button has **no shadow** and **no hover changes**
- ✅ Icon visibility: ChevronRight hidden on mobile (`hidden sm:inline`)
- ✅ All buttons are **full-width on mobile**, `auto-width` on desktop

---

## 5. DATA PERSISTENCE & STATE SYNC

### Progress Data Structure
```typescript
type ProgressState = {
  solved: Record<string, {
    solvedAt: number;          // timestamp of completion
    attempts: number;          // total attempts on problem
    lastAccepted?: boolean;    // true if most recent run was accepted
  }>;
};
```

### State Determination Logic
```typescript
const isSolved = progress.solved[problem.id]?.lastAccepted === true;
const isInProgress = progress.solved[problem.id] && !isSolved;
const isNotStarted = !progress.solved[problem.id];
```

### Persistence Rules
1. **On App Load:**
   - `localStorage` is read to hydrate `progress` state
   - Cards immediately render with correct visual state
   - No flashing or state updates needed

2. **On Problem Completion:**
   - `progress.solved[problemId].lastAccepted` is set to `true`
   - `progress.solved[problemId].solvedAt` is set to `Date.now()`
   - `localStorage` is updated
   - Card immediately transitions to COMPLETED state
   - Status badge updates
   - Button disables
   - Title text dims
   - Checkmark appears

3. **On Return from CodingWorkspace:**
   - If user solved the problem: card shows COMPLETED state
   - If user attempted but didn't solve: card shows IN_PROGRESS state
   - If user just opened: card shows IN_PROGRESS state (with "Last opened" label)
   - Progress counter updates automatically

---

## 6. EMPTY STATE

**Trigger:** All problems in topic are completed

**Display:**
```
✓ (icon, size: 4xl, color: text-slate-700)
"All problems completed!"
"Excellent work! You've finished all problems in this concept. 
 Explore other concepts or revisit any problem to improve your solution."
```

**Styling:**
- Container: `flex flex-col items-center justify-center py-16 px-6`
- Content: `text-center space-y-3 max-w-sm`
- Icon: `text-4xl font-black text-slate-700 mb-2`
- Title: `text-xl font-black text-slate-300`
- Message: `text-slate-500 text-sm leading-relaxed`

---

## 7. TOPIC FILTER TABS

**Location:** Sticky header above problem list

**Behavior:**
- Click to switch topics
- Active tab: `bg-indigo-600/90 text-white border-indigo-400/50`
- Inactive tab: `bg-slate-900/50 border-white/5 text-slate-400`
- Hover state: Inactive tabs get `text-slate-300 border-white/10`
- Smooth scroll horizontal (no vertical jump)

**Note:** Tabs remain sticky when scrolling problem list

---

## 8. INTERACTION FLOW

### Viewing Problem List
1. User sees header: "Introduction" + "Pick a problem and start coding..."
2. Progress counter shows: "0 / 2 completed" (or current count)
3. Cards display with correct visual states
4. User can immediately see which problems are done (green left bar + checkmark)

### Starting a Problem
1. User clicks "Start Coding" button on a NOT_STARTED card
2. CodingWorkspace opens with problem details
3. Code editor pre-filled with `initialCode`
4. User submits solution

### Completing a Problem
1. Solution accepted by Judge
2. Success overlay appears with "Problem Completed!" message
3. User clicks "Back to Practice"
4. Returns to problem list
5. Card now shows COMPLETED state (green bar, checkmark, disabled button)
6. Progress counter updates (e.g., "1 / 2 completed")
7. Can click card again to review problem

### Resuming a Problem
1. User clicks "Continue" button on IN_PROGRESS card
2. CodingWorkspace opens
3. Problem is pre-filled with code from last attempt (if available)
4. User can submit again

---

## 9. DESIGN PRINCIPLES

### Clarity
✅ Color coding immediately communicates state (gray/blue/green)
✅ Left accent bar is the primary state indicator (scanned left-to-right)
✅ Status badges confirm state with text
✅ Button text changes based on state (Start vs. Continue vs. Completed)

### Confidence
✅ Completed problems are visually distinct (dimmed, checkmark, disabled button)
✅ Progress counter shows momentum
✅ "Last opened" label reminds user of recent work
✅ "Can return anytime" subtitle reduces anxiety

### Simplicity
✅ No distracting animations (only hover transitions)
✅ No gamification elements (XP, streaks, badges)
✅ No complexity: three simple states, one action per state
✅ Mobile-first layout: single column, full-width cards

### Accessibility
✅ Color is not the only indicator (text badges + accent bar + text changes)
✅ Buttons are large enough for touch (48px minimum)
✅ Icon + text in badges (not icon-only)
✅ Disabled state is clear (muted colors, disabled attribute)

---

## 10. COMPONENT REFERENCES

**File:** `screens/practice/PracticeHub.tsx`

**Key Functions:**
- `getRecommendedProblemId()` - Suggests next problem
- `getRecentAccuracy()` - Calculates success rate for adaptive difficulty
- `getNextProblemAdaptive()` - Selects next problem based on accuracy

**State Variables:**
- `progress` - Tracks problem completion
- `selectedProblem` - Current problem (opens CodingWorkspace)
- `activeTopicId` - Current topic filter

**Computed Values:**
- `isSolved` - Problem is completed
- `isInProgress` - Problem has attempts but not solved
- `filteredProblems` - Problems in active topic (respecting difficulty/search filters)

---

## 11. TESTING CHECKLIST

- [ ] Card displays correct visual state (color, icon, text) for each state
- [ ] Button text matches state (Start Coding / Continue / Completed)
- [ ] Completed button is disabled (no click events, muted styling)
- [ ] Clicking problem card opens CodingWorkspace
- [ ] Clicking button on card opens CodingWorkspace (not on completed)
- [ ] After solving, progress persists across page refresh
- [ ] After solving, status badge changes to "Completed ✓"
- [ ] After solving, checkmark appears on title
- [ ] Progress counter updates (N / Total completed)
- [ ] "Last opened" label appears for IN_PROGRESS and COMPLETED
- [ ] Topic tabs are clickable and show active state
- [ ] Empty state displays when all problems completed
- [ ] Mobile layout: cards are full-width, button below content
- [ ] Desktop layout: content left, button right
- [ ] Difficulty badges show correct colors and text
- [ ] Concept tags display and wrap correctly
- [ ] No visual regressions on mobile devices (< 640px)

---

## 12. FUTURE ENHANCEMENTS

**NOT currently implemented (out of scope):**
- [ ] Search by problem title
- [ ] Difficulty filter (easy / medium / hard)
- [ ] Estimated time to solve
- [ ] Hints without opening problem
- [ ] Discussion threads
- [ ] Multiple test case visibility
- [ ] Code comparison (your solution vs. official solution)
- [ ] Upvote/downvote problems
- [ ] Report bugs/issues

---

## Summary

The Practice List is a **clean, state-aware interface** that:
- Uses **color coding** (gray/blue/green) for instant state recognition
- Provides **context-specific CTAs** (Start / Continue / Completed)
- **Persists progress** across sessions
- **Removes friction** with clear visual feedback
- **Builds confidence** by tracking momentum

**No gamification.** Just clear, honest progress tracking.
