# Lesson Visual Guide - Keywords and Identifiers

## Layout Preview

### Mobile Phone (350×610)

```
┌─────────────────────────────────┐
│ ← Lesson: Keywords and Identif. │  [Header - Sticky]
├─────────────────────────────────┤
│                                 │
│  ⏱ 20 mins  📊 Beginner       │  [Metadata Badges]
│                                 │
│  2. Keywords and Identifiers    │  [Title]
│  ─────────────────────────────  │
│                                 │
│  # C Keywords                   │  [Section H1 - Large]
│                                 │
│  Keywords in C are reserved ... │  [Paragraph - Readable]
│  You cannot use them as ...     │
│                                 │
│  Important: All C keywords ...  │  [Callout - Bold]
│                                 │
│  ## Complete List               │  [Section H2 - Border]
│                                 │
│  ┌─────────────┬──────────────┐ │
│  │   auto      │    break     │ │  [Keyword Grid - 2 Cols]
│  ├─────────────┼──────────────┤ │
│  │   case      │    char      │ │
│  ├─────────────┼──────────────┤ │
│  │   const     │  continue    │ │
│  └─────────────┴──────────────┘ │
│                                 │
│  ## What Keywords Do            │  [Section H2 - Border]
│                                 │
│  These keywords are used to:    │  [List with › markers]
│  › Declare variables            │
│  › Control program flow         │
│  › Manage memory behavior       │
│                                 │
│  ────────────────────────────   │  [Divider]
│                                 │
│  # C Identifiers                │  [Section H1]
│                                 │
│  Identifiers are the names ...  │  [Paragraph]
│  They are used for variables... │
│                                 │
│  ## Rules for Writing           │  [Section H2]
│                                 │
│  ### 1. Characters Allowed      │  [Section H3]
│                                 │
│  An identifier can only contain:│  [Sub-section]
│  › Letters: a–z, A–Z           │
│  › Digits: 0–9                 │
│  › Underscore: _               │
│                                 │
│  ### 2. No Leading Digits       │  [Section H3]
│                                 │
│  › ✓ Valid: number             │  [Valid Examples]
│  › ✓ Valid: _count             │
│  › ✗ Invalid: 9number          │  [Invalid Examples]
│                                 │
│  ## How They Work Together      │  [Section H2]
│                                 │
│  ### Example 1:                 │  [Code Example]
│  ┌──────────────────────────┐  │
│  │ int number;              │  │  [Code Block]
│  │                          │  │
│  │ int = keyword (type)     │  │
│  │ number = identifier      │  │
│  └──────────────────────────┘  │
│                                 │
│  [Content continues below...]   │
│                                 │
│ ────────────────────────────── │  [Sticky Footer Area]
│ Quiz complete. Ready for next. │
│     [Start Quiz →]              │  [CTA Button - Sticky]
└─────────────────────────────────┘
```

## Keyword Grid Detail

### Two-Column Layout (Mobile)
```
┌─────────┬──────────┐
│  auto   │  break   │
├─────────┼──────────┤
│  case   │   char   │
├─────────┼──────────┤
│ const   │ continue │
├─────────┼──────────┤
│ default │    do    │
└─────────┴──────────┘
```

### Three-Column Layout (Tablet)
```
┌──────────┬──────────┬──────────┐
│   auto   │  break   │   case   │
├──────────┼──────────┼──────────┤
│  char    │  const   │ continue │
├──────────┼──────────┼──────────┤
│ default  │    do    │  double  │
└──────────┴──────────┴──────────┘
```

## Keyword Chip Styling

### Default State
```
┌─────────────┐
│   auto      │  <- Monospace font
│             │  <- Gradient background
└─────────────┘     (indigo accent)
   Text color: #a5b4fc (light indigo)
   Border: 1px solid rgba(99, 102, 241, 0.3)
   Padding: 10px 16px
   Border-radius: 8px
```

### Hover/Active State
```
┌─────────────┐  ↑ (translateY -2px)
│   auto      │  <- Lighter gradient
│             │  <- Brighter text
└─────────────┘
   Text color: #e0e7ff
   Border: 1px solid rgba(99, 102, 241, 0.5)
   Background: More opaque gradient
```

## Section Spacing

```
Previous Content
   ↓
   (2.5rem margin-top)
   ↓
═════════════════════════════════  <- H1 Section Start
   (1.5rem margin-bottom)
   ↓
# C Keywords                       <- H1 Title
   (1.5rem margin-bottom)
   ↓
Keywords in C are reserved...      <- Paragraph
   (1rem margin-bottom)
   ↓
You cannot use them as...          <- Paragraph
   (2rem margin-top for H2)
   ↓
═════════════════════════════════  <- H2 Section Start
## Rules for Identifiers           <- H2 Title (with bottom border)
   (1.25rem margin-bottom)
   ↓
Content...
```

## Typography Sizes

### Mobile (320-380px)
- H1: 24px (1.5rem)
- H2: 18px (1.125rem)
- H3: 18px (1.125rem)
- Body: 15px (0.95rem)
- Keyword Chip: 12.8px (0.8rem)

### Tablet & Desktop (641px+)
- H1: 36px (2.25rem)
- H2: 26px (1.625rem)
- H3: 18px (1.125rem)
- Body: 16px (1rem)
- Keyword Chip: 13.6px (0.85rem)

## Color Palette

```
Text: #e2e8f0 (slate-200)
Paragraph: #cbd5e1 (slate-300)
Keyword Chip:
  - Default text: #a5b4fc (indigo-300)
  - Hover text: #e0e7ff (indigo-100)
  - Background: linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(99, 102, 241, 0.05))
  - Border: rgba(99, 102, 241, 0.3)

List Markers:
  - Valid (✓): #22c55e (green-500)
  - Invalid (✗): #ef4444 (red-500)
  - Default (›): #60a5fa (blue-400)

Headers:
  - H2 Bottom Border: rgba(99, 102, 241, 0.2)
  - Divider: linear-gradient(to right, transparent, rgba(255, 255, 255, 0.1), transparent)
```

## Animation States

### Keyword Chip Hover (Desktop)
- Duration: 0.2s
- Easing: ease
- Transform: translateY(-2px)
- Opacity change: Smooth gradient transition

### Keyword Chip Active (Mobile)
- Duration: 0.15s
- Easing: ease
- Transform: None (avoid motion on mobile)
- Background: Changes to hover state

## Accessibility Features

✅ Semantic heading hierarchy (H1 → H2 → H3)
✅ Proper list markup with custom styling
✅ Color contrast: WCAG AA compliant
✅ Focus states for keyboard navigation
✅ Mobile-friendly touch targets (44px minimum)
✅ Readable line-height (1.7)
✅ Sufficient paragraph spacing

## Lesson Completion State

```
After scrolling to bottom:

────────────────────────────────
Lesson completed

Complete the quiz to unlock the 
next lesson

    [Start Quiz →]              <- Sticky button
────────────────────────────────

After quiz completion:

────────────────────────────────
Quiz complete. Ready for the next lesson

    [Start Quiz →]              <- Changes to "Next Lesson →"
────────────────────────────────
```

## Performance Metrics

- **First Paint:** < 1s (prose rendering)
- **Largest Contentful Paint:** < 2s
- **Keyword Grid Render:** < 50ms
- **CSS File Size:** ~6KB
- **No layout shifts** when loading images/keywords
- **GPU-accelerated:** All animations use transform
