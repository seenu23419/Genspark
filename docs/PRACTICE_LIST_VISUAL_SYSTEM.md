# Practice List Page - Visual Design System & Component Guide

## COMPLETE VISUAL SPECIFICATION

---

## 1. COLOR SYSTEM

### State Color Palette
```
NOT STARTED (Gray)
├─ Accent Bar:    bg-slate-500/40
├─ Border:        border-white/10 → border-white/20 (hover)
├─ Background:    bg-slate-900/30 → bg-slate-900/50 (hover)
├─ Text (Title):  text-white → text-indigo-300 (hover)
├─ Badge BG:      bg-slate-800/60
├─ Badge Border:  border-slate-600/50
├─ Badge Text:    text-slate-400
└─ Concept Tag:   bg-slate-800/60 text-slate-400

IN PROGRESS (Blue)
├─ Accent Bar:    bg-blue-500
├─ Border:        border-blue-500/30 → border-blue-500/50 (hover)
├─ Background:    bg-slate-900/40 → bg-slate-900/60 (hover)
├─ Text (Title):  text-white (same as not started)
├─ Badge BG:      bg-blue-500/20
├─ Badge Border:  border-blue-500/50
├─ Badge Dot:     bg-blue-400 (animate-pulse)
├─ Badge Text:    text-blue-400
├─ Button:        bg-blue-600 hover:bg-blue-700
└─ Concept Tag:   bg-slate-800/60 text-slate-400

COMPLETED (Emerald)
├─ Accent Bar:    bg-emerald-500 (full brightness)
├─ Border:        border-white/5 → border-white/10 (hover) [VERY SUBTLE]
├─ Background:    bg-slate-900/20 → bg-slate-900/30 (hover) [DIMMED]
├─ Text (Title):  text-slate-400 [DIMMED]
├─ Checkmark:     text-emerald-500 (next to title)
├─ Badge BG:      bg-emerald-500/20
├─ Badge Border:  border-emerald-500/50
├─ Badge Icon:    Check icon text-emerald-400
├─ Badge Text:    text-emerald-400
├─ Button:        bg-emerald-600/20 text-emerald-300 (disabled)
└─ Concept Tag:   bg-slate-800/40 text-slate-500 [DIMMED]
```

### Supporting Colors
```
Dark Background:        bg-slate-950
Card Surface:           bg-slate-900 (various opacities)
Borders/Dividers:       border-white/5 to border-white/10
Text (Primary):         text-white
Text (Secondary):       text-slate-400 / text-slate-500
Text (Tertiary):        text-slate-600 / text-slate-700

Button Colors:
├─ Primary Indigo:      bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/20
├─ Primary Blue:        bg-blue-600 hover:bg-blue-700 shadow-blue-600/20
└─ Secondary (Muted):   bg-emerald-600/20 text-emerald-300 (no shadow, no hover)
```

---

## 2. TYPOGRAPHY SYSTEM

### Header
```
Topic Title
├─ Size:     text-2xl md:text-3xl
├─ Weight:   font-black
├─ Color:    text-white
└─ Spacing:  mb-2 (within header container)

Subtitle
├─ Size:     text-xs md:text-sm
├─ Weight:   font-normal (default)
├─ Color:    text-slate-400
└─ Spacing:  flex-1 (grows to fill available space)

Progress Counter
├─ Size:     text-xs
├─ Weight:   font-semibold
├─ Color:    text-slate-500
└─ Alignment: text-right (inside flex justify-between)
```

### Card Content
```
Difficulty Badge
├─ Size:     text-[8px]
├─ Weight:   font-bold
├─ Case:     UPPERCASE
├─ Spacing:  tracking-wide
└─ Variant:  Easy/Medium/Hard (color-coded)

"Last opened" Label
├─ Size:     text-[7px]
├─ Weight:   font-semibold
├─ Case:     UPPERCASE
├─ Color:    text-slate-500
└─ Visibility: Only if IN_PROGRESS or COMPLETED

Problem Title
├─ Size:     text-base sm:text-lg
├─ Weight:   font-black
├─ Color:    text-white (or text-slate-400 if completed)
├─ Line:     leading-snug
├─ Max:      line-clamp-2 (no more than 2 lines)
└─ Icon:     Check icon if completed (18px, text-emerald-500)

Concept Tag
├─ Size:     text-[8px]
├─ Weight:   font-medium
├─ Color:    text-slate-400 (or text-slate-500 if completed)
└─ Background: bg-slate-800/60 (or bg-slate-800/40 if completed)
```

### Button Text
```
Primary Buttons (Start Coding, Continue)
├─ Size:     text-sm
├─ Weight:   font-bold
├─ Case:     UPPERCASE
├─ Spacing:  tracking-wide
├─ Align:    center (flex items-center justify-center)
└─ Gap:      gap-2 (between text and icon)

Secondary Button (Completed)
├─ Size:     text-sm
├─ Weight:   font-bold
├─ Case:     UPPERCASE
├─ Spacing:  tracking-wide
├─ Align:    center (flex items-center justify-center)
└─ Icon:     Check icon (16px, matching text color)
```

---

## 3. SPACING SYSTEM

### Container/Card Spacing
```
Card Padding:
├─ Mobile:   p-5 (padding: 1.25rem)
├─ Desktop:  sm:p-6 (padding: 1.5rem)
└─ Button Padding (right side): pr-32 (mobile) sm:pr-6 (desktop)

Content Layout:
├─ Main axis gap:     gap-4 (between content section and button)
├─ Vertical gap in header: space-y-2
└─ Content gaps:
    ├─ Difficulty to concept: mb-2.5
    ├─ Difficulty + "Last opened": gap-3
    └─ Concept tags: gap-1.5

Button Spacing:
├─ Mobile:   w-full pt-2 (full width with margin-top)
├─ Desktop:  sm:w-auto sm:pt-0 (auto width, no margin)
└─ Internal: px-6 py-3 (left/right 1.5rem, up/down 0.75rem)

List Spacing:
├─ Wrapper:  space-y-3 (gap between cards)
├─ Header:   space-y-6 (gap between header and list)
└─ Container: py-6 md:py-8 (vertical padding of list container)
```

### Responsive Breakpoints
```
Mobile (< 640px):
├─ px-3 (container horizontal padding)
├─ text-xs (many text elements)
├─ text-base (titles)
├─ text-sm (buttons)
├─ Icons: hidden (ChevronRight in buttons)
└─ Layout: Full-width cards, flex-col (no side-by-side)

Desktop (≥ 640px):
├─ px-8 (container horizontal padding)
├─ text-sm (subtitles, descriptions)
├─ text-lg (card titles)
├─ text-sm (buttons, same size)
├─ Icons: visible (ChevronRight in buttons)
└─ Layout: Side-by-side (sm:flex-row), button right-aligned
```

---

## 4. COMPONENT SPACING DIAGRAM

```
┌─────────────────────────────────────────────┐
│ HEADER (space-y-2)                          │
│ ├─ "Introduction" (title)                  │
│ └─ "Pick a problem..." | "0/2 completed"   │
├─────────────────────────────────────────────┤
│ (space-y-6)                                 │
├─────────────────────────────────────────────┤
│ CARD 1 (p-5 sm:p-6, space-y-3 internal)    │
│ ┌───────────────────────────────────────┐  │
│ │█ Easy | Last opened                   │  │
│ │█ Problem Title ✓                      │  │
│ │█ [Concept Tag]              [Button]  │  │
│ └───────────────────────────────────────┘  │
├─────────────────────────────────────────────┤
│ (space-y-3)                                 │
├─────────────────────────────────────────────┤
│ CARD 2 (p-5 sm:p-6)                        │
│ ┌───────────────────────────────────────┐  │
│ │█ Medium                               │  │
│ │█ Another Problem                      │  │
│ │█ [Concept Tag]              [Button]  │  │
│ └───────────────────────────────────────┘  │
└─────────────────────────────────────────────┘

Legend:
█ = Left accent bar (1px wide)
```

---

## 5. BUTTON VARIANTS

### Size Specifications
```
All buttons: px-6 py-3 rounded-lg
├─ Width (mobile):   w-full (100% of container)
├─ Width (desktop):  sm:w-auto (auto-size to content)
├─ Height:           py-3 = 12px + 24px font = 36px+ (48px with line-height)
├─ Border Radius:    rounded-lg (0.5rem)
└─ Focus:            focus:outline focus:ring (browser default)
```

### NOT STARTED Button
```
Classes:
  bg-indigo-600
  hover:bg-indigo-700
  text-white
  border border-indigo-500
  shadow-lg shadow-indigo-600/20
  hover:shadow-indigo-600/30
  transition-all
  active:scale-95

Structure:
  <button>
    <span>Start Coding</span>
    <ChevronRight size={16} className="hidden sm:inline" />
  </button>

States:
  ├─ Default:  Indigo, full opacity
  ├─ Hover:    Darker indigo, increased shadow
  ├─ Active:   Slightly scaled down (active:scale-95)
  └─ Focus:    Browser default outline
```

### IN PROGRESS Button
```
Classes:
  bg-blue-600
  hover:bg-blue-700
  text-white
  border border-blue-500
  shadow-lg shadow-blue-600/20
  hover:shadow-blue-600/30
  transition-all
  active:scale-95

Structure: Same as "Start Coding" (just different color + text)

Difference from "Start Coding":
  └─ Only difference is color (blue vs. indigo)
  └─ Styling is otherwise identical
  └─ Both have shadow, both have hover effects
```

### COMPLETED Button
```
Classes:
  bg-emerald-600/20
  text-emerald-300
  border border-emerald-500/30
  cursor-default
  hover:bg-emerald-600/20  (no change on hover)
  transition-all
  disabled={true}

Structure:
  <button disabled>
    <Check size={16} className="text-emerald-300" />
    <span>Completed</span>
  </button>

Distinctive Features:
  ├─ Muted colors (bg-emerald-600/20, not full brightness)
  ├─ No shadow (unlike Start/Continue buttons)
  ├─ Hover state doesn't change (unlike Start/Continue)
  ├─ Disabled attribute prevents click events
  ├─ cursor-default (not pointer)
  └─ Check icon instead of ChevronRight
```

---

## 6. STATUS BADGE VARIANTS

### NOT STARTED Badge
```
Position: Absolute, top-right (top-3 right-3, z-10)

Classes:
  px-3 py-1.5
  bg-slate-800/60
  border border-slate-600/50
  rounded-full
  text-[10px] font-bold uppercase tracking-wider

Content:
  <span className="text-slate-400">Not Started</span>

Visual: Subtle gray pill, low emphasis
```

### IN PROGRESS Badge
```
Position: Absolute, top-right (top-3 right-3, z-10)

Classes:
  px-3 py-1.5
  bg-blue-500/20
  border border-blue-500/50
  rounded-full
  flex items-center gap-1

Content:
  <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400">
    In Progress
  </span>

Visual: Blue pill with animated pulsing dot (indicates active work)
```

### COMPLETED Badge
```
Position: Absolute, top-right (top-3 right-3, z-10)

Classes:
  px-3 py-1.5
  bg-emerald-500/20
  border border-emerald-500/50
  rounded-full
  flex items-center gap-1

Content:
  <Check size={14} className="text-emerald-400" />
  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
    Completed ✓
  </span>

Visual: Green pill with checkmark icon (immediately recognizable)
```

---

## 7. DIFFICULTY BADGE VARIANTS

### Easy
```
Classes:
  px-2.5 py-1
  rounded
  text-[8px] font-bold uppercase tracking-wide
  border
  bg-emerald-400/10
  border-emerald-400/20
  text-emerald-400
  flex-shrink-0

Text: "Easy"
```

### Medium
```
Classes:
  px-2.5 py-1
  rounded
  text-[8px] font-bold uppercase tracking-wide
  border
  bg-amber-400/10
  border-amber-400/20
  text-amber-400
  flex-shrink-0

Text: "Medium"
```

### Hard
```
Classes:
  px-2.5 py-1
  rounded
  text-[8px] font-bold uppercase tracking-wide
  border
  bg-rose-400/10
  border-rose-400/20
  text-rose-400
  flex-shrink-0

Text: "Hard"
```

---

## 8. ACCENT BAR SYSTEM (Left Border)

```
Implementation:
  <div className={`w-1 flex-shrink-0 ${leftBarColor}`} />

Positioning:
  - Position: First child in card flex container
  - Width: w-1 (0.25rem = 4px)
  - Height: Full height of card (auto stretches)
  - Flex: flex-shrink-0 (never shrinks)

Color Classes:
  NOT_STARTED → bg-slate-500/40  (gray, subtle)
  IN_PROGRESS → bg-blue-500      (bright blue)
  COMPLETED   → bg-emerald-500   (bright green)

Visual:
  ┌─────────────────────────┐
  │█│ Card content...       │
  │█│                       │
  │█│ [Button]              │
  └─────────────────────────┘
  
  Legend: █ = 4px accent bar
```

---

## 9. RESPONSIVE BEHAVIOR

### Mobile (< 640px)
```
Card Layout:
  flex flex-col
  items-start
  
Button Position:
  Below content
  Full width (w-full)
  Margin-top: pt-2

Icon Visibility:
  ChevronRight icons: hidden

Text Sizes:
  Card title: text-base
  Most text: text-xs or text-[8px]

Padding:
  Container: px-3
  Card: p-5
  
Overall: Vertical stack, touch-friendly spacing
```

### Desktop (≥ 640px)
```
Card Layout:
  sm:flex-row
  sm:items-center
  sm:justify-between

Button Position:
  Right side, inline with content
  Auto width (sm:w-auto)
  No margin (sm:pt-0)

Icon Visibility:
  ChevronRight icons: sm:inline (visible)

Text Sizes:
  Card title: sm:text-lg
  Other text: sm:text-sm

Padding:
  Container: md:px-8
  Card: sm:p-6

Overall: Horizontal layout, spacious alignment
```

---

## 10. ANIMATION & TRANSITION SYSTEM

### Enabled Transitions
```
Cards:
  transition-all duration-200
  ├─ Background color: 200ms ease
  ├─ Border color: 200ms ease
  └─ Transform (hover): implicit

Buttons:
  transition-all
  active:scale-95 (press feedback)
  ├─ Background color: implicit duration
  ├─ Shadow: implicit duration
  └─ Transform (press): instant

Status Badge (In Progress):
  animate-pulse (infinite loop)
  ├─ Opacity from 100% to 50%
  ├─ 2s duration
  └─ Only on pulsing dot element
```

### Disabled Animations
```
Distraction Prevention:
  ✓ No page transition animations
  ✓ No entrance/exit animations
  ✓ No spinning loaders or progress bars
  ✓ No color-shifting backgrounds
  ✓ No fade-in delays
  
Only Subtle Effects:
  ✓ Hover state changes (200ms)
  ✓ Active state press feedback (scale-95)
  ✓ Pulse dot on In Progress badge (reassurance of work)
```

---

## 11. DARK MODE (Current Theme Only)

The app uses a dark theme exclusively:
```
Background Surfaces:
  Primary (app bg):     #0f172e (bg-slate-950)
  Secondary (cards):    #1e293b (bg-slate-900)
  Tertiary (hover):     #334155 (bg-slate-700)

Text Layers:
  Primary:              #ffffff (text-white)
  Secondary:            #cbd5e1 (text-slate-300)
  Tertiary:             #94a3b8 (text-slate-400)
  Disabled:             #64748b (text-slate-500)

Accent Colors:
  Primary (indigo):     #4f46e5 (indigo-600)
  Success (emerald):    #10b981 (emerald-500)
  Info (blue):          #3b82f6 (blue-500)
  Warning (amber):      #f59e0b (amber-400)
  Danger (rose):        #f43f5e (rose-400)

No light mode planned (out of scope)
```

---

## SUMMARY

The Practice List uses:
- **3 visual states** with distinct color coding (gray/blue/green)
- **Consistent spacing** system (gaps and padding)
- **Clear typography hierarchy** (sizes and weights)
- **Context-aware buttons** (different text and styling per state)
- **Subtle animations** (hover, pulse, press feedback only)
- **Mobile-first responsive design** (flex, gaps, text scaling)
- **Dark theme exclusively** (no light mode)

All elements work together to create clarity, reduce cognitive load, and build user confidence.
