import type { ReactNode } from "react";
import AnimatedSection from "./AnimatedSection";

interface SectionWrapperProps {
  eyebrow?: string;
  title: string;
  intro?: string;
  children: ReactNode;
  className?: string;
}

export default function SectionWrapper({
  eyebrow,
  title,
  children,
  intro,
  className = "",
}: SectionWrapperProps) {
  return (
    <section className={`border-t border-black/10 px-4 py-14 sm:py-18 lg:py-20 ${className}`}>
      <AnimatedSection className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-3xl text-center">
          {eyebrow && (
            <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-[rgba(0,207,255,0.28)] bg-white px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-black shadow-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--brand-cyan)]" />
              {eyebrow}
            </p>
          )}
          <h2 className="text-3xl font-bold leading-tight text-black sm:text-4xl">
            {title}
          </h2>
          {intro && (
            <p className="mt-4 text-base leading-7 text-black/65 sm:text-lg">
              {intro}
            </p>
          )}
        </div>
        <div className="mt-8 sm:mt-10">{children}</div>
      </AnimatedSection>
    </section>
  );
}
