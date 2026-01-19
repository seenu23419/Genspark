/**
 * Mobile Testing Checklist
 * 
 * Use this checklist to verify mobile responsiveness before deploying.
 */

export const mobileTestingChecklist = {
  viewport: [
    '✓ Viewport meta tag allows user zoom (user-scalable=yes)',
    '✓ initial-scale=1.0 is set',
    '✓ viewport-fit=cover for notch support'
  ],
  
  touchTargets: [
    '✓ All buttons are minimum 44x44 pixels',
    '✓ All links are minimum 44x44 pixels',
    '✓ Touch targets have at least 8px padding',
    '✓ Touch targets are not too close together'
  ],
  
  typography: [
    '✓ Body text is at least 16px on mobile',
    '✓ Headings scale responsively (text-xl md:text-2xl)',
    '✓ Line height is at least 1.5 for readability',
    '✓ Line length is not too long (max-w-xl or similar)'
  ],
  
  layout: [
    '✓ Content fits within viewport without horizontal scroll',
    '✓ Images are responsive (w-full or max-w-*)',
    '✓ Forms are single-column on mobile',
    '✓ Navigation is accessible on mobile (bottom nav or hamburger)'
  ],
  
  forms: [
    '✓ Input fields are at least 44px tall on mobile',
    '✓ Keyboard type is correct (email, tel, number, etc.)',
    '✓ Form labels are visible and associated with inputs',
    '✓ Form validation errors are clear and accessible'
  ],
  
  images: [
    '✓ Images are responsive (width: 100% on mobile)',
    '✓ Images use srcset for different screen sizes',
    '✓ Large images are lazy-loaded',
    '✓ Images have descriptive alt text'
  ],
  
  performance: [
    '✓ Page loads in under 3 seconds on 4G',
    '✓ Interactions respond in under 100ms',
    '✓ Scrolling is smooth (60fps)',
    '✓ No layout shifts during load (CLS < 0.1)'
  ],
  
  accessibility: [
    '✓ All interactive elements are keyboard accessible',
    '✓ Focus indicators are visible',
    '✓ Color contrast is sufficient (WCAG AA)',
    '✓ Text is readable at browser zoom levels'
  ],
  
  orientation: [
    '✓ App works in portrait and landscape',
    '✓ Content is readable in both orientations',
    '✓ Orientation changes do not cause layout breaks',
    '✓ Safe area is respected (notches, home indicators)'
  ],
  
  browser: [
    '✓ Tested on Chrome mobile',
    '✓ Tested on Safari iOS',
    '✓ Tested on Firefox mobile',
    '✓ Tested on Samsung Internet'
  ]
};

/**
 * Quick mobile audit using Lighthouse
 * 
 * In Chrome DevTools:
 * 1. Open DevTools (F12)
 * 2. Go to Lighthouse tab
 * 3. Select "Mobile"
 * 4. Run audit
 * 
 * Target scores:
 * - Performance: >90
 * - Accessibility: >90
 * - Best Practices: >90
 * - SEO: >90
 */

/**
 * Debug mobile issues
 * 
 * 1. Open DevTools → Device Toolbar (Ctrl+Shift+M)
 * 2. Select device (iPhone 12, Pixel 5, etc.)
 * 3. Throttle network (Slow 4G)
 * 4. Check for:
 *    - Layout shifts
 *    - Text being cut off
 *    - Buttons being too small
 *    - Images not loading
 *    - Scrolling performance
 */
