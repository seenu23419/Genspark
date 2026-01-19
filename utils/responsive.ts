/**
 * Mobile-responsive utility functions for consistent sizing
 */

/**
 * Responsive padding for mobile/tablet/desktop
 * Mobile: 3 (12px) → Tablet: 4 (16px) → Desktop: 6 (24px)
 */
export const responsivePadding = 'px-3 md:px-4 lg:px-6';

/**
 * Responsive gap between elements
 * Mobile: 2 (8px) → Tablet: 3 (12px) → Desktop: 4 (16px)
 */
export const responsiveGap = 'gap-2 md:gap-3 lg:gap-4';

/**
 * Responsive font sizes (text)
 * Mobile: sm (14px) → Tablet: base (16px) → Desktop: lg (18px)
 */
export const responsiveText = 'text-sm md:text-base lg:text-lg';

/**
 * Responsive font sizes (headings)
 * Mobile: xl (20px) → Tablet: 2xl (24px) → Desktop: 3xl (30px)
 */
export const responsiveHeading = 'text-xl md:text-2xl lg:text-3xl';

/**
 * Responsive width for containers
 * Mobile: full width with padding, Tablet: md, Desktop: lg
 */
export const responsiveContainer = 'w-full md:max-w-2xl lg:max-w-4xl mx-auto';

/**
 * Touch-friendly button sizes (minimum 44x44px per Apple HIG)
 * Mobile: h-11 w-11 (44px) → Desktop: h-12 w-12 (48px)
 */
export const responsiveButtonSize = 'h-11 w-11 md:h-12 md:w-12';

/**
 * Responsive grid layout
 * Mobile: 1 column → Tablet: 2 columns → Desktop: 3 columns
 */
export const responsiveGrid = 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';

/**
 * Responsive flex direction
 * Mobile: flex-col (vertical) → Desktop: flex-row (horizontal)
 */
export const responsiveDirection = 'flex-col md:flex-row';

/**
 * Responsive sidebar/main layout
 * Mobile: hidden (bottom nav only) → Desktop: flex (side nav)
 */
export const responsiveSidebar = 'hidden md:flex';

/**
 * Responsive bottom navigation (mobile only)
 * Desktop: hidden → Mobile: flex
 */
export const responsiveBottomNav = 'flex md:hidden';

/**
 * Example usage in components:
 *
 * <div className={responsiveContainer}>
 *   <h1 className={responsiveHeading}>Title</h1>
 *   <p className={responsiveText}>Content</p>
 * </div>
 */
