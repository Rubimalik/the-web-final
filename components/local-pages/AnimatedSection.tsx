"use client";

import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";

type AnimatedSectionProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
};

export default function AnimatedSection({
  children,
  className = "",
  delay = 0,
}: AnimatedSectionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const node = ref.current;
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateMotionPreference = () => setReduceMotion(motionQuery.matches);

    updateMotionPreference();
    motionQuery.addEventListener("change", updateMotionPreference);

    if (!node || motionQuery.matches) {
      return () => motionQuery.removeEventListener("change", updateMotionPreference);
    }

    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.15 },
    );

    observer.observe(node);

    return () => {
      observer.disconnect();
      motionQuery.removeEventListener("change", updateMotionPreference);
    };
  }, []);

  return (
    <div
      ref={ref}
      className={`transition-[opacity,transform] ease-out motion-reduce:transition-none ${className}`}
      style={{
        opacity: isVisible || reduceMotion ? 1 : 0,
        transform: isVisible || reduceMotion ? "translateY(0)" : "translateY(18px)",
        transitionDelay: reduceMotion ? "0ms" : `${delay}s`,
        transitionDuration: reduceMotion ? "0ms" : "600ms",
      }}
    >
      {children}
    </div>
  );
}
