# Mobile Optimization Guide

## Current Issues

The app has responsive design but may not optimize well for mobile:
- Large sidebar on desktop takes up space on mobile
- Fixed sizes that don't scale
- Viewport meta tag prevents user zoom (for PWA, but limits accessibility)
- Touch-friendly button sizes needed

## Mobile Fixes Implemented

### 1. Viewport Meta Tag (index.html)
- ✅ Removed `maximum-scale=1.0` to allow user zoom
- ✅ Set `initial-scale=1.0` and `viewport-fit=cover` for notches

### 2. Responsive Tailwind Breakpoints

#### Mobile-first sizes:
- **sm** (640px): Small phones
- **md** (768px): Tablets
- **lg** (1024px): Desktops
- **xl** (1280px): Large desktops

#### Current Layout:
- **Mobile:** Full-width with bottom navigation bar
- **Tablet (md):** Side nav appears
- **Desktop (lg+):** Full sidebar

### 3. Touch-Friendly Components

Ensure interactive elements are:
- **Min height:** 44px (recommended by Apple HIG)
- **Min width:** 44px
- **Padding:** At least 8px around tap targets

Example:
```tsx
<button className="h-11 w-11 md:h-12 md:w-12 p-2">
  Touch target
</button>
```

### 4. Font Scaling

Don't use fixed sizes; use Tailwind's responsive text:
```tsx
<h1 className="text-2xl md:text-3xl lg:text-4xl">
  Heading
</h1>
```

### 5. Container Queries

Wrap content in max-width container:
```tsx
<div className="max-w-7xl mx-auto px-4 md:px-6">
  Content
</div>
```

## Mobile Checklist

- [ ] Test on actual mobile devices (iPhone, Android)
- [ ] Test orientation changes (portrait ↔ landscape)
- [ ] Verify touch targets are 44x44px minimum
- [ ] Check font sizes are readable (16px+ on mobile)
- [ ] Test performance on 3G/4G networks
- [ ] Verify form inputs work on mobile keyboards
- [ ] Test scrolling smoothness

## Testing Mobile

### Using DevTools:
1. Open DevTools (F12)
2. Click device toolbar (Ctrl+Shift+M)
3. Select device (iPhone 12, Pixel 5, etc.)
4. Test responsive behavior

### Real Device Testing:
```bash
# On machine IP (Windows):
ipconfig getifaddr en0  # macOS
ipconfig  # Windows - find your IP
# Then on mobile: http://YOUR_IP:5173
```

## Performance on Mobile

### Optimization:
- ✅ Lazy load components with React.lazy()
- ✅ Code-split routes automatically
- ✅ Compress images (use WebP)
- ✅ Minimize bundle size
- ✅ Cache API responses with React Query

### Check Bundle Size:
```bash
npm run build
# Check dist/ folder size
```

## Common Mobile Issues

### Issue: Text too small
**Fix:** Use responsive font sizes
```tsx
className="text-sm md:text-base lg:text-lg"
```

### Issue: Buttons hard to tap
**Fix:** Ensure minimum 44x44px with padding
```tsx
className="h-11 w-11 p-2"
```

### Issue: Layout breaks on small screens
**Fix:** Use responsive classes
```tsx
className="flex flex-col md:flex-row"
```

### Issue: Images too large
**Fix:** Use responsive images
```tsx
<img 
  src="image.jpg" 
  alt="desc"
  className="w-full md:w-1/2 lg:w-1/3"
/>
```

## Progressive Enhancement

Features by device:
- **All devices:** Core functionality
- **Touch devices:** Gesture support
- **Large screens:** Advanced panels/sidebars

## Recommended Tools

- **Testing:** [BrowserStack](https://www.browserstack.com)
- **Performance:** [Lighthouse](https://developers.google.com/web/tools/lighthouse)
- **Responsive:** Chrome DevTools Device Mode
- **Analytics:** Sentry (monitors mobile crashes)

## Next Steps

1. **Test on real devices** using local IP
2. **Run Lighthouse audit** (DevTools → Lighthouse)
3. **Monitor mobile performance** in Sentry
4. **Gather user feedback** on mobile UX
