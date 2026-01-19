# Mobile-First UI Design Guide
## GenSpark Learning Platform - Android-First Standard

**Last Updated:** January 11, 2026  
**Status:** ✅ Implemented

---

## 📱 Device Baseline
- **Primary Device:** Android Mobile
- **Screen Size:** 360 × 800 dp
- **Scaling:** Responsive (scales 1x-3x)

---

## 🎯 1. GLOBAL LAYOUT RULES

### Horizontal Padding
```
- Everywhere: 16 dp (4px in Tailwind)
- Exception: Full-bleed backgrounds or navigation
```

### Vertical Spacing
```
- Section margins: 16-24 dp
- Element gap: 8-12 dp  
- Line height: 1.4x minimum
```

### Safe Area
```
- No text/buttons within 8 dp of screen edges
- Bottom padding: 56 dp (for nav) + 16 dp (content)
```

---

## 🏠 2. TOP APP BAR (HEADER)

**File:** `components/Layout.tsx` (Mobile header)

### Specifications
| Property | Value |
|----------|-------|
| Height | 56 dp (14 rem / 3.5 rem Tailwind) |
| Title Text | 18 sp → Tailwind `text-lg` |
| Back Button | 24 dp icon (5 dp padding = 48 dp touch) |
| Settings Icon | 24 dp icon on right |
| Padding | 16 dp left & right |
| Background | Semi-transparent + blur |

### Code Example
```tsx
<header className="h-14 px-4 flex items-center justify-between">
  <button className="w-12 h-12 flex items-center justify-center">
    {/* 24 dp icon inside 48 dp touch target */}
  </button>
  <span className="text-lg font-bold">Title</span>
  <button className="w-12 h-12">Settings</button>
</header>
```

---

## 🧭 3. BOTTOM NAVIGATION (CRITICAL)

**File:** `components/Layout.tsx` (Mobile bottom nav)

### ✅ Specifications (EXACT)
| Property | Value | Notes |
|----------|-------|-------|
| **Buttons** | **EXACTLY 4** | Home, Learn, Compiler, Profile |
| **Height** | 56 dp (h-14) | Standard Android |
| **Icon Size** | 24 dp | Always, no exceptions |
| **Label Text** | 12 sp (text-xs) | Single word only |
| **Touch Target** | 48 × 48 dp | Full button area |
| **Icon Spacing** | Centered above label | 4 dp gap |
| **Active Indicator** | Color change + text bold | Indigo-600 |
| **Inactive Color** | Slate-500 | Muted tone |

### ❌ What NOT to Do
```
❌ 5+ buttons (impossible to tap all)
❌ Badges or counts (adds clutter)
❌ Icons + text + badge together
❌ Less than 48 dp height
❌ Buttons smaller than 48 × 48 dp
```

### Mobile Bottom Nav Code
```tsx
<nav className="h-14 flex items-center justify-around">
  {navItems.map((item) => (
    <button className="flex-1 h-14 flex flex-col items-center justify-center gap-1">
      <item.icon size={24} />
      <span className="text-xs font-semibold">{item.label}</span>
    </button>
  ))}
</nav>
```

---

## 📄 4. CONTENT AREA (LESSONS / TEXT)

**File:** `screens/lessons/LessonsList.tsx`, `screens/lessons/LessonView.tsx`

### Text Sizing
| Element | Size | Weight | Line Height |
|---------|------|--------|-------------|
| Body Text | 14-16 sp | Regular | 1.4x |
| Section Heading | 18-20 sp | Bold | 1.2x |
| Card Title | 16 sp | Bold | 1.3x |
| Label | 12 sp | Semibold | 1.2x |
| Caption | 12 sp | Regular | 1.2x |

### Tailwind Mapping
```
14 sp → text-sm
16 sp → text-base  
18 sp → text-lg
20 sp → text-xl
```

### Spacing Rules
```
- Paragraph → 16 dp margin bottom
- Section heading → 16 dp margin top, 8 dp margin bottom
- List items → 8-12 dp gap
- Cards → 12-16 dp padding
```

### Content Padding
```
p-4 (16 dp) for mobile
md:p-8 (32 dp) for tablet/desktop
```

---

## 💻 5. CODE EDITOR (VERY IMPORTANT)

**File:** `screens/compiler/Compiler.tsx`, `components/InlineCompiler.tsx`

### Mobile Display
| Property | Value |
|----------|-------|
| **Height** | 40-50% of screen (min 200 dp) |
| **Font** | Monospace (Monaco) |
| **Font Size** | 13-14 sp → `text-xs` / `text-sm` |
| **Line Height** | 1.3-1.4 |
| **Background** | #1E1E1E (dark gray, NOT #000000) |
| **Padding** | 12 dp |
| **Border Radius** | 8 dp |

### Syntax Colors (NO PALETTE CHANGES)
```
Keyword:  Yellow / Blue (#FFC700 / #569CD6)
String:   Green (#6A9955)
Number:   Orange (#B5CEA8)
Comment:  Gray (#6A9955 / lighter)
Variable: White (#D4D4D4)
```

### Mobile Code Editor Layout
```tsx
<div className="h-1/2 md:h-[55%] bg-slate-900 rounded-lg overflow-hidden border border-white/10">
  <Editor
    height="100%"
    language={language}
    theme="vs-dark"
    fontSize={14}
    options={{
      fontFamily: "'JetBrains Mono', monospace",
      lineHeight: 1.5,
      scrollBeyondLastLine: false,
    }}
  />
</div>
```

---

## 🔘 6. ACTION BUTTONS (RUN / NEXT / SUBMIT)

**Files:** `screens/lessons/LessonView.tsx`, `screens/compiler/Compiler.tsx`

### Specifications
| Property | Value |
|----------|-------|
| **Height** | 48 dp (h-12) |
| **Padding** | 16 dp horizontal |
| **Text Size** | 14-16 sp → `text-sm` / `text-base` |
| **Border Radius** | 8-12 dp → `rounded-lg` / `rounded-xl` |
| **Touch Target** | Exactly 48 × 48 dp minimum |

### Primary Button
```tsx
<button className="w-full h-12 px-4 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold text-base active:scale-95">
  Continue
</button>
```

### Secondary Button
```tsx
<button className="w-full h-12 px-4 py-3 border border-indigo-500 text-indigo-400 rounded-lg font-semibold text-base active:scale-95">
  Cancel
</button>
```

### Spacing Between Buttons
```
- Vertical gap: 12-16 dp → gap-3 / gap-4
- Horizontal flex: Full width on mobile
- Stack on desktop: md:flex-row
```

---

## 🎯 7. QUIZ/OPTION CARDS

**Files:** `screens/quiz/Quiz.tsx`, Quiz components

### Option Card Specifications
| Property | Value |
|----------|-------|
| **Min Height** | 48 dp |
| **Text Size** | 14-15 sp → `text-sm` / `text-base` |
| **Padding** | 12-16 dp |
| **Gap Between Options** | 8-12 dp → gap-2 / gap-3 |
| **Selection Indicator** | 2 dp border or check icon |
| **Touch Area** | Full card (48 dp minimum) |

### Quiz Option Code
```tsx
<button
  onClick={() => selectOption(option.id)}
  className="w-full min-h-12 px-4 py-3 text-left border-2 rounded-lg transition-all
    ${selected ? 'border-indigo-500 bg-indigo-500/10' : 'border-white/10 hover:border-white/20'}"
>
  <span className="text-sm md:text-base">{option.text}</span>
</button>
```

---

## ⚙️ 8. SETTINGS PAGE

**File:** `screens/profile/Settings.tsx`

### Navigation
```
✅ Top-right icon in header (Settings)
✅ Also accessible from Profile tab
```

### Settings Row Specifications
| Property | Value |
|----------|-------|
| **Row Height** | 48-56 dp |
| **Icon Size** | 24 dp |
| **Title Text** | 16 sp → `text-base` |
| **Subtitle Text** | 12-13 sp → `text-xs` / `text-sm` |
| **Padding** | 16 dp left & right, 12 dp top & bottom |
| **Gap** | 12 dp between icon and text |

### Settings Row Code
```tsx
<button className="w-full h-14 px-4 flex items-center gap-4 hover:bg-white/5 rounded-lg transition-colors">
  <IconComponent size={24} className="text-slate-400 flex-shrink-0" />
  <div className="flex-1 text-left">
    <p className="text-base font-semibold text-white">Setting Name</p>
    <p className="text-xs text-slate-500">Optional description</p>
  </div>
  <ChevronRight size={20} className="text-slate-600" />
</button>
```

---

## 🔒 9. SAFE TOUCH RULE (CRITICAL)

**Every clickable element must be:**

```
┌─────────────────┐
│                 │  
│  Touch Target   │  Minimum 48 × 48 dp
│  48 × 48 dp     │  
│                 │  
└─────────────────┘

If smaller → Users miss taps → Rage → Uninstall → ❌
```

### Implementation Checklist
```
✅ Button height ≥ 48 dp (h-12)
✅ Button width ≥ 48 dp (full width or w-12)
✅ Icon clickable area ≥ 48 dp (w-12 h-12)
✅ Link padding ≥ 8 dp (p-2)
✅ All interactive elements within safe zone
```

---

## 📐 10. RESPONSIVE BREAKPOINTS

### Tailwind Media Queries (Default)
```
Mobile:      0 - 639 px (default, no prefix)
Tablet:      640 - 1023 px (sm:)
Desktop:     1024+ px (md:)
```

### Our Usage Pattern
```tsx
// Mobile first (no prefix)
<div className="text-base px-4 h-12">
  {/* Mobile: 16px text, 16dp padding, 48dp height */}
  
  {/* Tablet/Desktop: Larger text, more padding */}
  <div className="md:text-lg md:px-8 md:h-14" />
</div>
```

---

## 🚫 11. STRICT RULES (DO NOT VIOLATE)

### ❌ Color Palette
```
DO NOT change colors
Use existing: indigo, emerald, slate, red
Respect dark mode: dark: prefix
```

### ❌ Typography
```
DO NOT use fonts < 12 sp
DO NOT use line height < 1.2x
DO NOT exceed 60 characters per line
```

### ❌ Layout
```
DO NOT stack > 2 buttons horizontally on mobile
DO NOT use horizontal padding < 16 dp
DO NOT add bottom nav with 5+ tabs
DO NOT place critical content below 56 dp footer
```

### ❌ Spacing
```
DO NOT use gaps < 8 dp
DO NOT use margins > 32 dp on mobile
DO NOT mix padding systems (use consistent scale)
```

---

## ✅ TESTING CHECKLIST

Before shipping mobile UI:

- [ ] Test on 360 × 800 dp (Android baseline)
- [ ] All buttons are ≥ 48 × 48 dp
- [ ] Text is readable without zooming (≥ 14 sp)
- [ ] Tap targets have 8 dp spacing
- [ ] No content hidden behind nav bars
- [ ] Scroll performance smooth (60 fps)
- [ ] Tap feedback is immediate (active states)
- [ ] Keyboard doesn't overlap input fields
- [ ] Colors meet WCAG AA contrast ratio
- [ ] All 4 bottom nav buttons clickable

---

## 🔧 FILES UPDATED

1. ✅ `components/Layout.tsx` - Material Design nav bars
2. ✅ `screens/lessons/LessonsList.tsx` - Responsive lesson cards
3. ✅ `screens/lessons/LessonView.tsx` - Proper text sizing & buttons
4. ✅ `screens/compiler/Compiler.tsx` - Mobile code editor layout

---

## 📊 Quick Reference (Tailwind Classes)

```
Height:    h-12 (48 dp), h-14 (56 dp), h-10 (40 dp)
Padding:   p-4 (16 dp), p-6 (24 dp), p-8 (32 dp)
Text:      text-xs (12sp), text-sm (14sp), text-base (16sp), text-lg (18sp)
Gap:       gap-1 (4dp), gap-2 (8dp), gap-3 (12dp), gap-4 (16dp)
Radius:    rounded-lg (8dp), rounded-xl (12dp)
Width:     w-12 (48dp), w-full (100%), flex-1 (1fr)
Icons:     size-4 (16dp), size-5 (20dp), size-6 (24dp)
```

---

**Questions? Test on Android → Report inconsistencies → This guide evolves.**

