"use client";

import { gsap } from "gsap";
import { useEffect, useRef } from "react";

interface SectionNavigationProps {
  totalSections: number;
  currentSection: number;
  onSectionClick: (index: number) => void;
  className?: string;
}

export default function SectionNavigation({
  totalSections,
  currentSection,
  onSectionClick,
  className = "",
}: SectionNavigationProps) {
  const progressRef = useRef<HTMLDivElement>(null);
  const tooltipsRef = useRef<(HTMLDivElement | null)[]>([]);

  // Animate progress bar
  useEffect(() => {
    if (progressRef.current) {
      gsap.to(progressRef.current, {
        height: `${((currentSection + 1) / totalSections) * 100}%`,
        duration: 0.3,
        ease: "power2.inOut",
      });
    }
  }, [currentSection, totalSections]);

  const handleTooltipHover = (index: number, isEntering: boolean) => {
    const tooltip = tooltipsRef.current[index];
    if (tooltip) {
      gsap.to(tooltip, {
        opacity: isEntering ? 1 : 0,
        x: isEntering ? 0 : 10,
        duration: 0.2,
        ease: "power2.out",
      });
    }
  };

  return (
    <div className={`fixed top-1/2 right-6 z-50 hidden -translate-y-1/2 md:block ${className}`}>
      <nav className="flex flex-col gap-4">
        {Array.from({ length: totalSections }).map((_, index) => (
          <button
            key={index}
            onClick={() => onSectionClick(index)}
            className="group relative flex items-center justify-center p-2"
            aria-label={`Go to section ${index + 1}`}
            onMouseEnter={() => handleTooltipHover(index, true)}
            onMouseLeave={() => handleTooltipHover(index, false)}
          >
            {/* Dot indicator */}
            <div
              className={`h-6 w-6 cursor-pointer rounded-full border-2 border-white/60 transition-all duration-300 ${
                currentSection === index
                  ? "scale-125 bg-white"
                  : "bg-transparent hover:scale-110 hover:bg-white/40"
              }`}
            />

            {/* Hover tooltip */}
            <div
              ref={(el) => {
                tooltipsRef.current[index] = el;
              }}
              className="absolute right-full mr-3 hidden opacity-0 sm:block"
              style={{ transform: "translateX(10px)" }}
            >
              <div className="rounded-md bg-black/80 px-2 py-1 text-xs whitespace-nowrap text-white backdrop-blur-sm">
                {index === 0 ? "مشاور هوشمند" : "ارز های دیجیتال"}
              </div>
            </div>
          </button>
        ))}
      </nav>

      {/* Progress indicator */}
      <div className="absolute top-0 -left-1 h-full w-0.5 bg-white/20">
        <div ref={progressRef} className="w-full bg-blue-500" style={{ height: "0%" }} />
      </div>
    </div>
  );
}
