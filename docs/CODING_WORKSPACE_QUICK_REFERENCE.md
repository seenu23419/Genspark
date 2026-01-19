# Coding Workspace - Quick Reference Guide

## File Locations
- **Main Component:** [screens/practice/CodingWorkspace.tsx](screens/practice/CodingWorkspace.tsx)
- **Compiler Component:** [screens/compiler/Compiler.tsx](screens/compiler/Compiler.tsx)
- **Problem Data:** [data/practiceProblems.ts](data/practiceProblems.ts)
- **Full Documentation:** [docs/CODING_WORKSPACE_REFINEMENT.md](docs/CODING_WORKSPACE_REFINEMENT.md)

---

## 6 Requirements - Implementation Status

| # | Requirement | Status | Key Details |
|---|------------|--------|-------------|
| 1 | Language locked to C | ✅ | `language="c"` prop, no dropdown, "C Language" label visible |
| 2 | Problem statement visible | ✅ | Desktop: left sidebar (scrollable) / Mobile: collapsible panel |
| 3 | Status logic auto-updates | ✅ | NOT_STARTED → IN_PROGRESS (on typing) → COMPLETED (on success) |
| 4 | Action bar (sticky) | ✅ | Bottom bar with Run/Submit buttons, always visible, adaptive layout |
| 5 | Success state | ✅ | Full-screen overlay with checkmark, stats, "Back to Practice" & "Next Problem" |
| 6 | Return behavior | ✅ | Read-only mode for completed, "Edit & Retry" to re-enable editing |

---

## Status Pill States

### NOT STARTED (Gray)
```
Style:     bg-slate-800/60 border-slate-600/50 text-slate-400
Icon:      None
Animation: Static
User sees: "Not Started"
Triggers:  Initial state when opening fresh problem
```

### IN PROGRESS (Blue)
```
Style:     bg-blue-500/20 border-blue-500/50 text-blue-400
Icon:      Animated pulsing dot
Animation: animate-pulse
User sees: "● In Progress" with dot
Triggers:  When user types in editor
```

### COMPLETED (Green)
```
Style:     bg-emerald-500/20 border-emerald-500/50 text-emerald-400
Icon:      Check (12px)
Animation: None (static)
User sees: "✓ Completed"
Triggers:  When solution is submitted and accepted
```

---

## Action Bar Buttons

### Run Code (Secondary)
```
Always visible:    ✅
Styling:          bg-slate-700 hover:bg-slate-600
Icon:             Play (16px)
Text:             "Run" (hidden on mobile)
Disabled when:    isReadOnly = true
Action:           Execute code against test cases
```

### Submit Solution (Primary)
```
Always visible:    ✅
Styling:          bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/20
Icon:             Send (16px)
Text:             "Submit" (hidden on mobile)
Disabled when:    isReadOnly = true OR isSubmitting = true
Action:           Submit for final validation
States:           Normal → Submitting (spinner) → Complete
```

### Reset Code (Secondary)
```
Visibility:       Hidden when completed or read-only
Styling:          bg-slate-800 hover:bg-slate-700
Icon:             RotateCcw (16px)
Text:             "Reset" (hidden on mobile)
Disabled when:    isSubmitting = true
Action:           Clear code back to initialCode
```

### Edit & Retry (Secondary)
```
Visibility:       Only when completed AND read-only
Styling:          bg-slate-800 hover:bg-slate-700
Icon:             Edit2 (16px)
Text:             "Edit & Retry" (hidden on mobile)
Action:           Set isReadOnly = false, enable editing
Effect:           Converts read-only mode to editable
```

---

## Mobile vs Desktop Layout

| Element | Mobile | Desktop |
|---------|--------|---------|
| **Problem Panel** | Collapsible above editor (max-h-32) | Sticky sidebar (1/3 width) |
| **Editor** | Full width | 2/3 width |
| **Buttons** | Icon-only (text hidden) | Icon + text |
| **Action Bar** | Horizontal, may scroll | Horizontal, always fits |
| **Breakpoint** | < 640px | ≥ 640px |

---

## State Management Diagram

```
Opening Workspace
        ↓
┌───────────────────────────────┐
│ IF status prop = COMPLETED    │
│   isReadOnly = true           │
│   currentStatus = COMPLETED   │
└───────────────────────────────┘
        ↓
┌───────────────────────────────┐
│ IF status prop = NOT_STARTED  │
│   isReadOnly = false          │
│   currentStatus = NOT_STARTED │
└───────────────────────────────┘
        ↓
User Types Code
        ↓
handleCodeChange() fires
        ↓
IF !userHasTyped && currentStatus = NOT_STARTED:
   setCurrentStatus('IN_PROGRESS')
   setUserHasTyped(true)
        ↓
User Clicks Submit
        ↓
setIsSubmitting(true)
        ↓
Judge0 executes code
        ↓
IF accepted:
   Wait 800ms for visual feedback
   setCurrentStatus('COMPLETED')
   onComplete() callback fires
   Show success overlay
   setIsSubmitting(false)
ELSE:
   Show error in output
   setIsSubmitting(false)
```

---

## Code Integration Points

### Opening a Problem (From PracticeHub)
```tsx
<CodingWorkspace
  problem={selectedProblem}
  status={
    progress.solved[problem.id]?.lastAccepted
      ? 'COMPLETED'
      : progress.solved[problem.id]
      ? 'IN_PROGRESS'
      : 'NOT_STARTED'
  }
  onBack={() => setSelectedProblem(null)}
  onComplete={(problemId) => updateProgress(problemId)}
  onNext={() => setSelectedProblem(nextProblem)}
/>
```

### Compiler Props
```tsx
<Compiler 
  initialCode={problem.initialCode}
  onRun={handleRunResult}
  testcases={problem.testcases}
  onCodeChange={handleCodeChange}
  readOnly={isReadOnly}
  language="c"
/>
```

### Success Overlay Trigger
```tsx
if (result.accepted) {
  setIsSubmitting(true);
  setTimeout(() => {
    onComplete(problem.id);
    setShowSuccess(true);
    setIsSubmitting(false);
  }, 800);  // 800ms delay
}
```

---

## Key Callbacks

| Callback | From | To | Triggers |
|----------|------|----|-|
| `onBack()` | User clicks back button or success "Back to Practice" | PracticeHub | Navigate away |
| `onNext()` | User clicks "Next Problem" in success overlay | PracticeHub | Load next problem |
| `onComplete(problemId)` | Code is accepted & success shown | PracticeHub | Update progress |
| `handleRunResult(result)` | Compiler executes code | CodingWorkspace | Process execution result |
| `handleCodeChange()` | User types in editor | CodingWorkspace | Track typing for status |

---

## Success Overlay Timing

```
User clicks Submit
         ↓ (0ms)
setIsSubmitting(true)
Code sent to Judge0
         ↓ (100-500ms)
Judge0 returns result
         ↓ (500-800ms)
setTimeout wait for visual feedback
         ↓ (800ms)
onComplete() fires
setShowSuccess(true)
showSuccess state renders overlay
         ↓ (800ms+)
User sees:
  ✓ Checkmark (animated)
  "Problem Completed!"
  Execution stats
  Two buttons
```

---

## Common Interactions

### "I want to solve this problem fresh"
```
1. Open problem (status = NOT_STARTED)
2. Editor is editable, code ready
3. Type code → Status becomes IN PROGRESS
4. Click Run → Test code
5. Click Submit → If correct, success shows
```

### "I want to review my solution"
```
1. Open completed problem
2. Editor shows solution (read-only)
3. Status shows COMPLETED (green checkmark)
4. Run button available for reference
5. Submit button disabled
```

### "I want to retry a solved problem"
```
1. Open completed problem (read-only mode)
2. Click "Edit & Retry"
3. Editor becomes editable
4. Modify code if desired
5. Click Submit again
6. If new solution correct, success shows
```

### "I want to move to the next problem"
```
1. Submit solution
2. Success overlay appears
3. Click "Next Problem →"
4. New problem loads automatically
5. Status = NOT_STARTED
6. Fresh editor with new code
```

---

## CSS Classes Reference

### Status Badges
```tsx
// NOT STARTED
px-3 py-1.5 rounded-full text-[11px] font-black uppercase tracking-wider border
bg-slate-800/60 border-slate-600/50 text-slate-400

// IN PROGRESS  
px-3 py-1.5 rounded-full text-[11px] font-black uppercase tracking-wider border
bg-blue-500/20 border-blue-500/50 text-blue-400

// COMPLETED
px-3 py-1.5 rounded-full text-[11px] font-black uppercase tracking-wider border
bg-emerald-500/20 border-emerald-500/50 text-emerald-400
```

### Action Buttons
```tsx
// Primary (Submit)
px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 border-indigo-500
rounded-lg text-white text-sm font-bold transition-colors
shadow-lg shadow-indigo-600/20 flex items-center gap-2

// Secondary (Reset, Run, Edit)
px-4 py-2.5 bg-slate-800 hover:bg-slate-700 border-slate-700
rounded-lg text-white text-sm font-bold transition-colors
flex items-center gap-2
```

---

## Testing Checklist

- [ ] Open fresh problem → Status: NOT STARTED (gray)
- [ ] Type code → Status: IN PROGRESS (blue dot)
- [ ] Click Run → Code executes, output shows
- [ ] Click Submit (wrong answer) → Error shown, status stays IN PROGRESS
- [ ] Click Submit (correct) → Success overlay, status: COMPLETED (green)
- [ ] Click "Back to Practice" → Return to list, problem shows COMPLETED
- [ ] Open completed problem → Editor read-only, buttons disabled
- [ ] Click "Edit & Retry" → Editor editable, buttons enabled
- [ ] Click "Next Problem" → New problem loads
- [ ] Mobile: Problem panel collapses, buttons stack
- [ ] Mobile: All text is readable, buttons touch-friendly

---

## Performance Notes

- ✅ Success overlay shows after 800ms (allows user to see code execution feedback first)
- ✅ Status transitions are instant (no delays)
- ✅ Editor remains responsive (no blocking operations)
- ✅ Read-only mode uses Monaco's built-in feature (no performance hit)
- ✅ No animations except pulsing dot on IN PROGRESS status

---

## Future Enhancements (Out of Scope)

- [ ] Code syntax error highlighting before submit
- [ ] Real-time test case results
- [ ] Code history/version control
- [ ] Peer code review
- [ ] AI-powered hints
- [ ] Time tracking per problem
- [ ] Solution comparison
- [ ] Difficulty adjustment based on success

