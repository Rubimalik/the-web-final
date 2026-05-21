import { CheckCircle2 } from "lucide-react";
import AnimatedCard from "./AnimatedCard";

type CheckListProps = {
  items: string[];
  compact?: boolean;
  columns?: "two" | "three";
};

export default function CheckList({
  items,
  compact = false,
  columns = "three",
}: CheckListProps) {
  const gridClass =
    columns === "two"
      ? "grid gap-3 sm:grid-cols-2"
      : "grid gap-3 sm:grid-cols-2 lg:grid-cols-3";

  return (
    <ul className={gridClass}>
      {items.map((item, index) => (
        <AnimatedCard
          as="li"
          key={item}
          delay={Math.min(index * 0.05, 0.25)}
          className={`location-check-item flex items-start gap-3 rounded-lg border border-black/10 bg-white text-black/72 shadow-sm transition hover:-translate-y-0.5 hover:border-[rgba(0,207,255,0.34)] ${
            compact ? "px-4 py-3 text-sm sm:text-base" : "px-4 py-4 text-sm sm:text-base"
          }`}
        >
          <span className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[rgba(0,207,255,0.1)]">
            <CheckCircle2 className="h-4 w-4 text-[var(--brand-cyan)]" aria-hidden="true" />
          </span>
          <span className="leading-6">{item}</span>
        </AnimatedCard>
      ))}
    </ul>
  );
}
