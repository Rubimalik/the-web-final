import type { ReactNode } from "react";
import AnimatedSection from "./AnimatedSection";

type SectionWrapperProps = {
  eyebrow?: string;
  title: string;
  children: ReactNode;
  className?: string;
};

export default function SectionWrapper({
  eyebrow,
  title,
  children,
  className = "",
}: SectionWrapperProps) {
  return (
    <section className={`local-section-shell px-5 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24 ${className}`}>
      <AnimatedSection className="mx-auto max-w-[76rem]">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="local-section-heading text-3xl font-bold leading-tight sm:text-4xl lg:text-[2.75rem]">{title}</h2>
          <span className="mx-auto mt-4 block h-1 w-20 rounded-full bg-[var(--brand-pink-hover)] sm:mt-5" />
        </div>
        <div className="mt-10 sm:mt-12">{children}</div>
      </AnimatedSection>
    </section>
  );
}
