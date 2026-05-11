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
    <div className="w-full rounded-2xl border border-black/10 bg-white p-6 shadow-[0_18px_60px_rgba(15,23,42,0.08)] sm:p-8">
      <header className="mb-6 space-y-2 text-center">
        <h1 className="text-[26px] font-bold leading-tight text-black sm:text-[28px]">{title}</h1>
        {description ? (
          <p className="mx-auto max-w-sm text-sm leading-6 text-black/60">{description}</p>
        ) : null}
      </header>

      <div className="space-y-4">{children}</div>

      {footer ? <div className="mt-6 text-center">{footer}</div> : null}
    </div>
  );
}

