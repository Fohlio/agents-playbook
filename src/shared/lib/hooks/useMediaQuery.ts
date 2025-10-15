'use client';

import { useEffect, useState } from 'react';

/**
 * Hook to detect if a media query matches
 * 
 * Useful for responsive behavior based on Tailwind breakpoints.
 * 
 * @param query - Media query string (e.g., '(min-width: 768px)')
 * @returns Whether the media query currently matches
 * 
 * @example
 * ```tsx
 * function Component() {
 *   const isMobile = useMediaQuery('(max-width: 640px)');
 *   const isTablet = useMediaQuery('(min-width: 640px) and (max-width: 1024px)');
 *   const isDesktop = useMediaQuery('(min-width: 1024px)');
 *   
 *   return (
 *     <div>
 *       {isMobile && <MobileMenu />}
 *       {isDesktop && <DesktopMenu />}
 *     </div>
 *   );
 * }
 * ```
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);
    setMatches(mediaQuery.matches);

    const handler = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    // Modern browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handler);
      return () => mediaQuery.removeEventListener('change', handler);
    }

    // Fallback for older browsers
    mediaQuery.addListener(handler);
    return () => mediaQuery.removeListener(handler);
  }, [query]);

  return matches;
}

