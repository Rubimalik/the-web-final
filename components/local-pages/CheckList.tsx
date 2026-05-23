import { CheckCircle2 } from "lucide-react";
import AnimatedCard from "./AnimatedCard";

type CheckListProps = {
  items: string[];
  compact?: boolean;
  columns?: "two" | "three";
  boxed?: boolean;
};

export default function CheckList({
  items,
  compact = false,
  columns = "three",
  boxed = false,
}: CheckListProps) {
  const gridClass =
    columns === "two"
      ? "grid gap-4 sm:grid-cols-2"
      : "grid gap-4 sm:grid-cols-2 lg:grid-cols-3";

  return (
    <ul className={gridClass}>
      {items.map((item, index) => (
        <AnimatedCard
          as="li"
          key={item}
          delay={Math.min(index * 0.05, 0.25)}
          className={`location-check-item flex items-start gap-3 text-black/72 transition ${
            boxed
              ? "location-model-point min-h-20 rounded-lg p-4 text-sm sm:text-base"
              : `rounded-lg ${
                  compact ? "p-3 text-sm sm:text-base" : "p-4 text-sm sm:text-base"
                }`
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
