"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface UseSectionScrollOptions {
  threshold?: number;
  debounceMs?: number;
}

export const useSectionScroll = (options: UseSectionScrollOptions = {}) => {
  const { threshold = 0.5, debounceMs = 100 } = options;
  const [currentSection, setCurrentSection] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const sectionsRef = useRef<HTMLElement[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const lastScrollTime = useRef(0);
  const touchStartY = useRef(0);
  const touchEndY = useRef(0);

  // Register section elements
  const registerSection = useCallback((element: HTMLElement | null, index: number) => {
    if (element) {
      sectionsRef.current[index] = element;
    }
  }, []);

  // Smooth scroll to section
  const scrollToSection = useCallback((sectionIndex: number, smooth = true) => {
    const section = sectionsRef.current[sectionIndex];
    if (!section) return;

    setIsScrolling(true);
    section.scrollIntoView({
      behavior: smooth ? "smooth" : "auto",
      block: "start",
    });

    // Reset scrolling state after animation
    setTimeout(
      () => {
        setIsScrolling(false);
      },
      smooth ? 800 : 0
    );
  }, []);

  // Handle wheel events for section navigation
  const handleWheel = useCallback(
    (event: WheelEvent) => {
      if (isScrolling) return;

      const now = Date.now();
      if (now - lastScrollTime.current < debounceMs) return;

      event.preventDefault();
      lastScrollTime.current = now;

      const direction = event.deltaY > 0 ? 1 : -1;
      const nextSection = Math.max(
        0,
        Math.min(sectionsRef.current.length - 1, currentSection + direction)
      );

      if (nextSection !== currentSection) {
        setCurrentSection(nextSection);
        scrollToSection(nextSection);
      }
    },
    [currentSection, debounceMs, isScrolling, scrollToSection]
  );

  // Handle touch events
  const handleTouchStart = useCallback((event: TouchEvent) => {
    touchStartY.current = event.touches[0].clientY;
  }, []);

  const handleTouchEnd = useCallback(
    (event: TouchEvent) => {
      if (isScrolling) return;

      touchEndY.current = event.changedTouches[0].clientY;
      const deltaY = touchStartY.current - touchEndY.current;
      const minSwipeDistance = 50; // Minimum swipe distance to trigger section change

      if (Math.abs(deltaY) > minSwipeDistance) {
        const now = Date.now();
        if (now - lastScrollTime.current < debounceMs) return;

        lastScrollTime.current = now;
        const direction = deltaY > 0 ? 1 : -1;
        const nextSection = Math.max(
          0,
          Math.min(sectionsRef.current.length - 1, currentSection + direction)
        );

        if (nextSection !== currentSection) {
          event.preventDefault();
          setCurrentSection(nextSection);
          scrollToSection(nextSection);
        }
      }
    },
    [currentSection, debounceMs, isScrolling, scrollToSection]
  );

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (isScrolling) return;

      let nextSection = currentSection;

      switch (event.key) {
        case "ArrowDown":
        case "PageDown":
          event.preventDefault();
          nextSection = Math.min(sectionsRef.current.length - 1, currentSection + 1);
          break;
        case "ArrowUp":
        case "PageUp":
          event.preventDefault();
          nextSection = Math.max(0, currentSection - 1);
          break;
        case "Home":
          event.preventDefault();
          nextSection = 0;
          break;
        case "End":
          event.preventDefault();
          nextSection = sectionsRef.current.length - 1;
          break;
        default:
          return;
      }

      if (nextSection !== currentSection) {
        setCurrentSection(nextSection);
        scrollToSection(nextSection);
      }
    },
    [currentSection, isScrolling, scrollToSection]
  );

  // Set up intersection observer for section detection
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (isScrolling) return;

        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio >= threshold) {
            const sectionIndex = sectionsRef.current.findIndex(
              (section) => section === entry.target
            );
            if (sectionIndex !== -1 && sectionIndex !== currentSection) {
              setCurrentSection(sectionIndex);
            }
          }
        });
      },
      {
        threshold,
        rootMargin: "-10% 0px -10% 0px",
      }
    );

    sectionsRef.current.forEach((section) => {
      if (section) observer.observe(section);
    });

    return () => observer.disconnect();
  }, [currentSection, isScrolling, threshold]);

  // Set up event listeners
  useEffect(() => {
    const container = containerRef.current || document.body;

    // Add wheel event listener with passive: false to allow preventDefault
    container.addEventListener("wheel", handleWheel, { passive: false });
    document.addEventListener("keydown", handleKeyDown);

    // Add touch event listeners
    container.addEventListener("touchstart", handleTouchStart, { passive: false });
    container.addEventListener("touchend", handleTouchEnd, { passive: false });

    return () => {
      container.removeEventListener("wheel", handleWheel);
      document.removeEventListener("keydown", handleKeyDown);
      container.removeEventListener("touchstart", handleTouchStart);
      container.removeEventListener("touchend", handleTouchEnd);
    };
  }, [handleWheel, handleKeyDown, handleTouchStart, handleTouchEnd]);

  // Navigation methods
  const goToNext = useCallback(() => {
    const nextSection = Math.min(sectionsRef.current.length - 1, currentSection + 1);
    if (nextSection !== currentSection) {
      setCurrentSection(nextSection);
      scrollToSection(nextSection);
    }
  }, [currentSection, scrollToSection]);

  const goToPrevious = useCallback(() => {
    const prevSection = Math.max(0, currentSection - 1);
    if (prevSection !== currentSection) {
      setCurrentSection(prevSection);
      scrollToSection(prevSection);
    }
  }, [currentSection, scrollToSection]);

  const goToSection = useCallback(
    (index: number) => {
      if (index >= 0 && index < sectionsRef.current.length && index !== currentSection) {
        setCurrentSection(index);
        scrollToSection(index);
      }
    },
    [currentSection, scrollToSection]
  );

  return {
    currentSection,
    isScrolling,
    containerRef,
    registerSection,
    goToNext,
    goToPrevious,
    goToSection,
    totalSections: sectionsRef.current.length,
  };
};
