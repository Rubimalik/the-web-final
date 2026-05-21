import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import AnimatedCard from "./AnimatedCard";

interface IconCardProps {
  icon: LucideIcon;
  title: string;
  children?: ReactNode;
}

export default function IconCard({ icon: Icon, title, children }: IconCardProps) {
  return (
    <AnimatedCard
      as="article"
      className="location-check-item flex h-full flex-col rounded-lg border border-black/10 bg-white p-5 shadow-sm"
    >
      <div className="mb-4 h-0.5 w-10 rounded-full bg-[var(--brand-cyan)]" />
      <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-[rgba(0,207,255,0.22)] bg-[rgba(0,207,255,0.1)] text-[var(--brand-cyan)]">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="mt-4 text-lg font-bold leading-snug text-black">{title}</h3>
      {children && <div className="mt-3 text-sm leading-6 text-black/65">{children}</div>}
    </AnimatedCard>
  );
}
