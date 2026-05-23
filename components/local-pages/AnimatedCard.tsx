"use client";

import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";

type AnimatedCardElement = "article" | "details" | "div" | "li" | "span";

type AnimatedCardProps = {
  as?: AnimatedCardElement;
  children: ReactNode;
  className?: string;
  delay?: number;
};

export default function AnimatedCard({
  as: Component = "div",
  children,
  className = "",
  delay = 0,
}: AnimatedCardProps) {
  const ref = useRef<HTMLElement | null>(null);
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
      { threshold: 0.18 },
    );

    observer.observe(node);

    return () => {
      observer.disconnect();
      motionQuery.removeEventListener("change", updateMotionPreference);
    };
  }, []);

  return (
    <Component
      ref={(node: HTMLElement | null) => {
        ref.current = node;
      }}
      className={`local-card-hover transition-[opacity,transform] ease-out motion-reduce:transition-none ${className}`}
      style={{
        opacity: isVisible || reduceMotion ? 1 : 0,
        transform: isVisible || reduceMotion ? "translateY(0)" : "translateY(14px)",
        transitionDelay: reduceMotion ? "0ms" : `${delay}s`,
        transitionDuration: reduceMotion ? "0ms" : "560ms",
      }}
    >
      {children}
    </Component>
  );
}
