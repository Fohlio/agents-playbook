"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Hook for scroll-triggered animations
 *
 * Observes element visibility and triggers animation classes
 * when element enters viewport
 */
export function useScrollAnimation(threshold = 0.1) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !isVisible) {
            setIsVisible(true);
          }
        });
      },
      {
        threshold,
        rootMargin: "0px 0px -100px 0px", // Trigger slightly before element enters
      }
    );

    observer.observe(element);

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, [threshold, isVisible]);

  return { ref, isVisible };
}
