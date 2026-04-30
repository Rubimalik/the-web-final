"use client";

import { useId, useState } from "react";
import type { ChangeEvent } from "react";
import { Eye, EyeOff } from "lucide-react";

export default function PasswordInput({
  label,
  value,
  onChange,
  placeholder,
  autoComplete,
  required,
  disabled,
  error,
  name,
}: {
  label: string;
  value: string;
  onChange: (next: string) => void;
  placeholder?: string;
  autoComplete?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  name?: string;
}) {
  const id = useId();
  const [show, setShow] = useState(false);

  const describedBy = error ? `${id}-error` : undefined;

  return (
    <div className="space-y-2">
      <label htmlFor={id} className="text-sm font-semibold text-black/75">
        {label}
      </label>

      <div className="relative">
        <input
          id={id}
          name={name}
          type={show ? "text" : "password"}
          value={value}
          onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          aria-invalid={!!error}
          aria-describedby={describedBy}
          autoComplete={autoComplete}
          className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm text-black placeholder:text-black/35 outline-none transition focus:border-[var(--brand-cyan)] focus:ring-2 focus:ring-[var(--brand-cyan)]/25"
        />

        <button
          type="button"
          onClick={() => setShow((v) => !v)}
          disabled={disabled}
          aria-label={show ? "Hide password" : "Show password"}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-black/50 hover:text-black/80 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--brand-cyan)]/25"
        >
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>

      {error ? (
        <p id={`${id}-error`} className="text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

