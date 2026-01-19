# Learning-First Coding Page - Visual Layout Guide

## Desktop Layout (1024px+)

```
╔════════════════════════════════════════════════════════════════════╗
║ Back | Problem: Two Sum        Status: IN PROGRESS (blue pulse) ●  ║
╠════════════════════════════════════════════════════════════════════╣
║ 📖 PROBLEM STATEMENT              [▼ Collapse]                     ║
║ ┌─────────────────────────────────────────────────────────────────┐║
║ │ Difficulty: Medium                 Concept: Hash Tables        ││
║ │                                                                 ││
║ │ Description:                                                    ││
║ │ Given an array of integers nums and an integer target, return  ││
║ │ the indices of the two numbers that add up to the target.      ││
║ │                                                                 ││
║ │ Test Cases: 3                                                  ││
║ │ Your solution must pass all test cases to complete.            ││
║ └─────────────────────────────────────────────────────────────────┘║
╠════════════════════════════════════════════════════════════════════╣
║ 💻 CODE ZONE        C (Language locked)   IN PROGRESS             ║
║ ┌────────────────────────────────────────────────────────────────┐║
║ │ #include <stdio.h>                                             ││
║ │ #include <stdlib.h>                                            ││
║ │                                                                ││
║ │ int main() {                                                   ││
║ │     int arr[4] = {2, 7, 11, 15};                              ││
║ │     int target = 9;                                           ││
║ │                                                                ││
║ │     for (int i = 0; i < 4; i++) {                            ││
║ │         for (int j = i + 1; j < 4; j++) {                    ││
║ │             if (arr[i] + arr[j] == target) {                ││
║ │                 printf("%d %d\n", i, j);                   ││
║ │             }                                                 ││
║ │         }                                                      ││
║ │     }                                                          ││
║ │     return 0;                                                 ││
║ │ }                                                              ││
║ └────────────────────────────────────────────────────────────────┘║
║ ✓ All tests passed!                                              ║
║ [Reset] [Run Tests] [Submit ✓]                                   ║
╠════════════════════════════════════════════════════════════════════╣
║ 💬 LEARNING GUIDE                     [Show/Hide]                 ║
║ ┌────────────────────────────────────────────────────────────────┐║
║ │ Excellent! Your solution correctly identifies the two numbers ││
║ │ that sum to the target.                                        ││
║ │                                                                ││
║ │ Here's what your code does well:                              ││
║ │ • Correctly iterates through array pairs                      ││
║ │ • Proper bounds checking (i < 4, j = i+1)                    ││
║ │ • Accurate comparison logic (sum == target)                   ││
║ │ • Clean output format                                         ││
║ │                                                                ││
║ │ When ready to move on:                                        ││
║ │ ► Next concept: Optimizing with Hash Tables (O(n) time)      ││
║ │ ► Advanced: Can you solve this in single pass?               ││
║ │                                                                ││
║ └────────────────────────────────────────────────────────────────┘║
╚════════════════════════════════════════════════════════════════════╝
```

---

## Mobile Layout (<640px) - Collapsed

```
┌──────────────────────────────┐
│ ◄ Two Sum      Status: ●     │ (16px header)
├──────────────────────────────┤
│ 📖 Problem      [▶ Expand]   │ (12px - collapsed)
├──────────────────────────────┤
│                              │
│   #include <stdio.h>         │
│   ...                        │
│   // Editor (70% height)     │
│   ...                        │
│                              │
│ [Reset] [Run Tests] [Submit] │
├──────────────────────────────┤
│ 💬 Learning Guide [▼]        │ (40% - collapsible)
│                              │
│ Scroll here for feedback...  │
│                              │
└──────────────────────────────┘
```

---

## Mobile Layout (<640px) - Expanded Problem Zone

```
┌──────────────────────────────┐
│ ◄ Two Sum      Status: ●     │
├──────────────────────────────┤
│ 📖 Problem      [▼ Collapse] │
│ Difficulty: Medium           │
│                              │
│ Description:                 │
│ Given an array of integers...│
│                              │
│ Test Cases: 3                │
│                              │
│ [Scroll ↓ for more]          │
├──────────────────────────────┤
│ [Run Tests] [Submit]         │
└──────────────────────────────┘
```

---

## Status Indicator States

### NOT STARTED (Default)
```
┌──────────────────────────────┐
│ ◄ Problem Title    NOT STARTED│
└──────────────────────────────┘
  Gray badge, no icon
```

### IN PROGRESS (User typing)
```
┌──────────────────────────────┐
│ ◄ Problem Title    ● IN PROGRESS (pulsing)
└──────────────────────────────┘
  Blue badge, animated dot
```

### COMPLETED (Tests pass)
```
┌──────────────────────────────┐
│ ◄ Problem Title    ✓ COMPLETED│
└──────────────────────────────┘
  Green badge, checkmark
```

---

## Error Display - Inline in Code Zone

```
╔═══════════════════════════════════════════════╗
│ 💻 CODE ZONE        C (Language locked)      │
├───────────────────────────────────────────────┤
│ ⚠️  ERROR ON LINE 5                           │
│ Syntax Error: Expected ';' before 'return'   │
│ Check feedback zone for explanation [×]      │
├───────────────────────────────────────────────┤
│ #include <stdio.h>                            │
│ int main() {                                  │
│     printf("Hello")   // ← Line 5 error       │
│     return 0;                                 │
│ }                                             │
└───────────────────────────────────────────────┘
```

---

## Success Modal

```
╔═══════════════════════════════════════════════╗
│                                               │
│              ✓ checkmark animation           │
│                                               │
│         Problem Completed!                   │
│                                               │
│    You solved this problem yourself.          │
│    Excellent work on your learning journey.  │
│                                               │
│    Completed on: Jan 14, 2026 3:45 PM        │
│                                               │
│    Execution Time: 12ms                       │
│    Memory Used: 256 KB                        │
│                                               │
│ [Back to Problems]  [Next Problem →]          │
│                                               │
╚═══════════════════════════════════════════════╝
```

---

## Problem Zone - Expanded View

```
╔════════════════════════════════════════════════╗
│ 📖 PROBLEM STATEMENT              [▼ Collapse] │
├────────────────────────────────────────────────┤
│ DETAILS                                        │
│ Medium  Hash Tables                           │
│                                                │
│ DESCRIPTION                                    │
│ Given an array of integers nums and an        │
│ integer target, return the indices of the     │
│ two numbers that add up to the target.        │
│                                                │
│ You may assume that each input has exactly    │
│ one solution, and you cannot use the same     │
│ element twice.                                │
│                                                │
│ Example:                                       │
│ Input: nums = [2,7,11,15], target = 9         │
│ Output: [0,1]                                  │
│                                                │
│ CONCEPTS                                       │
│ Hash Tables  Arrays  Two Pointers             │
│                                                │
│ TEST CASES: 3                                  │
│ Your solution must pass all test cases to     │
│ complete this problem.                        │
│                                                │
│ [Scroll up/down: PageUp/PageDown or mouse]    │
╚════════════════════════════════════════════════╝
```

---

## Difficulty Badges

```
┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│ ✓ Easy      │  │ △ Medium    │  │ ⚠ Hard      │
│ Green       │  │ Amber       │  │ Red         │
└─────────────┘  └─────────────┘  └─────────────┘
```

---

## Language Lock Indicator

```
╔═════════════════════════════════════════════╗
│ 💻 CODE ZONE      C (Language locked) │ ●  │
└─────────────────────────────────────────────┘
  Language shown + "locked" indicator ensures
  user cannot accidentally change language
```

---

## Feedback Zone - Error State

```
╔═════════════════════════════════════════════╗
│ 💬 Error Feedback                  [×Close]│
├─────────────────────────────────────────────┤
│ I see you got a compilation error on line 5:│
│ "Expected ';' before 'return'"             │
│                                              │
│ This means the C compiler expected a        │
│ semicolon (;) at the end of a statement    │
│ but found 'return' instead.                 │
│                                              │
│ Here's what's happening:                    │
│ Line 5: printf("Hello")   ← Missing `;`     │
│                                              │
│ In C, every statement ends with a semicolon │
│ This tells the compiler: "statement done"   │
│                                              │
│ Try this:                                    │
│ 1. Look at line 5                           │
│ 2. Check each statement for semicolons      │
│ 3. Add missing semicolons                   │
│ 4. Run tests again                          │
│                                              │
│ Can you find and fix the issue?             │
│                                              │
└─────────────────────────────────────────────┘
```

---

## Feedback Zone - Success State

```
╔═════════════════════════════════════════════╗
│ 💬 Success!                    [×Close]     │
├─────────────────────────────────────────────┤
│ ✓ All tests passed!                        │
│                                              │
│ Excellent work! Your solution:              │
│ • Correctly solves the problem              │
│ • Passes all 3 test cases                   │
│ • Uses efficient algorithm logic            │
│                                              │
│ Performance Stats:                           │
│ Execution Time: 12ms (Fast!)                │
│ Memory: 256 KB (Efficient)                  │
│                                              │
│ Learning Path Next:                         │
│ You've learned: Arrays + Loops              │
│ Next Step: Hash Tables for O(1) lookup      │
│                                              │
│ Ready for more challenges?                  │
│ [Back to Problems]  [Next Problem →]        │
│                                              │
└─────────────────────────────────────────────┘
```

---

## Action Bar States

### Before Submission
```
Status: ✓ All tests passed!
[Reset] [Run Tests] [Submit ✓]
```

### On Error
```
Status: ⚠ Error - Check feedback
[Reset] [Run Tests] [Submit (disabled)]
```

### On Success (Read-Only)
```
Status: ✓ Completed
[Reset (disabled)] [Run Tests (disabled)] [Submit (disabled)]
```

---

## Keyboard Shortcuts

```
┌─────────────────────────────────────────┐
│ NAVIGATION SHORTCUTS                    │
├─────────────────────────────────────────┤
│ Tab          → Next interactive element │
│ Shift+Tab    → Previous element         │
│ Space/Enter  → Activate button          │
│ Escape       → Close modal (if open)    │
└─────────────────────────────────────────┘
```

---

## Zone Heights - Responsive

### Desktop (1024px+)
```
Header:       64px (fixed)
Problem:      auto (collapsible, max 240px)
Code:         50-60% remaining
Feedback:     40% remaining
Total:        100vh
```

### Tablet (640-1024px)
```
Header:       64px (fixed)
Problem:      Collapsible (less screen space)
Code:         60% remaining
Feedback:     Toggleable (appears below)
Total:        100vh
```

### Mobile (<640px)
```
Header:       64px (fixed)
Problem:      Collapsible (collapsed by default)
Code:         70% remaining
Feedback:     Toggleable (appears below code)
Total:        100vh
```

---

## Color Palette

### Status Colors
- **Not Started**: `#64748b` (Slate-500)
- **In Progress**: `#3b82f6` (Blue-500)
- **Completed**: `#10b981` (Emerald-500)

### Difficulty Colors
- **Easy**: `#10b981` (Emerald)
- **Medium**: `#f59e0b` (Amber)
- **Hard**: `#ef4444` (Red)

### Action Colors
- **Primary/Submit**: `#10b981` (Emerald-600)
- **Secondary/Reset**: `#1e293b` (Slate-800)
- **Tertiary/Run**: `#475569` (Slate-700)

### Background Colors
- **Main**: `#020617` (Slate-950)
- **Secondary**: `#0f172a` (Slate-900)
- **Panels**: `#1e293b` (Slate-800)
- **Hover**: `#334155` (Slate-700)

---

## Animation Timings

```
Collapse/Expand:    300ms ease-in-out
Status Pulse:       1.5s linear (infinite)
Success Checkmark:  400ms ease-out
Button Hover:       150ms ease-in-out
Text Transitions:   200ms ease
```

---

## Accessibility Features - Visual

```
✓ High Contrast: White text on dark (4.5:1+)
✓ Focus Indicators: Blue outline on buttons
✓ Icons + Text: Never icon-only buttons
✓ Color Diversity: Not sole differentiator
✓ Font Size: Min 14px for readability
✓ Line Height: 1.5+ for comfortable reading
✓ Touch Targets: Min 44px for mobile buttons
```

---

## Component Size Reference

```
Header:            64px height
Zone Headers:      48px height
Buttons:           44px height (mobile), 36px (desktop)
Icons:             16-24px
Padding:           16px (mobile), 24px (desktop)
Gap Between:       12px (mobile), 16px (desktop)
Border Radius:     8px (buttons), 12px (panels)
```

---

**Visual Design Status**: ✅ Complete  
**Last Updated**: January 14, 2026  
**Component**: screens/practice/CodingWorkspace.tsx
