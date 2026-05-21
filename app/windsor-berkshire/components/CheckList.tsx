import { CheckCircle2 } from "lucide-react";
import AnimatedCard from "./AnimatedCard";

interface CheckListProps {
  items: string[];
  columns?: string;
}

export default function CheckList({ items, columns = "lg:grid-cols-3" }: CheckListProps) {
  return (
    <ul className={`grid auto-rows-fr gap-3 sm:grid-cols-2 ${columns}`}>
      {items.map((item, index) => (
        <AnimatedCard
          as="li"
          key={item}
          className="location-check-item flex h-full items-start gap-3 rounded-lg border border-black/10 bg-white px-4 py-4 text-sm font-semibold leading-6 text-black/70 shadow-sm"
          delay={Math.min(index, 5) * 0.05}
        >
          <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[rgba(0,207,255,0.1)]">
            <CheckCircle2 className="h-4 w-4 text-[var(--brand-cyan)]" />
          </span>
          <span>{item}</span>
        </AnimatedCard>
      ))}
    </ul>
  );
}
