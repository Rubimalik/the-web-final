import type { ReactNode } from "react";

export default function AuthForm({
  title,
  description,
  children,
  footer,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="w-full rounded-2xl border border-black/10 bg-white/80 p-6 sm:p-7 shadow-sm">
      <header className="space-y-2 mb-6">
        <h1 className="text-2xl font-bold leading-tight">{title}</h1>
        {description ? (
          <p className="text-sm text-black/65 leading-relaxed">{description}</p>
        ) : null}
      </header>

      <div className="space-y-4">{children}</div>

      {footer ? <div className="mt-6">{footer}</div> : null}
    </div>
  );
}

