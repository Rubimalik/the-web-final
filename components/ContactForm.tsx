"use client";

import { FormEvent, useState } from "react";
import { safeReadJsonResponse } from "@/lib/safe-json";

const inputClass =
  "w-full rounded-lg border border-black/15 bg-white px-4 py-3 text-sm text-black placeholder:text-black/45 focus:border-[var(--brand-cyan)] focus:outline-none";

interface ContactFormProps {
  source?: string;
}

export default function ContactForm({ source }: ContactFormProps) {
  const [state, setState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("loading");
    setMessage("");

    const form = event.currentTarget;
    const formData = new FormData(form);
    const payload = Object.fromEntries(formData.entries());

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await safeReadJsonResponse<{ error?: string }>(
        response,
        "ContactForm submit",
      );

      if (!response.ok) {
        throw new Error(data?.error || "Failed to send message");
      }

      form.reset();
      setState("success");
      setMessage("Message sent. Our team will get back to you shortly.");
    } catch (error) {
      setState("error");
      setMessage(error instanceof Error ? error.message : "Failed to send message");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
      {source ? <input type="hidden" name="source" value={source} /> : null}
      <div>
        <label className="text-xs uppercase tracking-widest text-black/60 mb-1.5 block">
          Name
        </label>
        <input type="text" name="name" required className={inputClass} />
      </div>
      <div>
        <label className="text-xs uppercase tracking-widest text-black/60 mb-1.5 block">
          Email
        </label>
        <input type="email" name="email" required className={inputClass} />
      </div>
      <div>
        <label className="text-xs uppercase tracking-widest text-black/60 mb-1.5 block">
          Phone
        </label>
        <input type="tel" name="phone" required className={inputClass} />
      </div>
      <div>
        <label className="text-xs uppercase tracking-widest text-black/60 mb-1.5 block">
          Subject
        </label>
        <input type="text" name="subject" required className={inputClass} />
      </div>
      <div className="sm:col-span-2">
        <label className="text-xs uppercase tracking-widest text-black/60 mb-1.5 block">
          Message
        </label>
        <textarea
          name="message"
          required
          rows={5}
          className={`${inputClass} resize-none`}
        />
      </div>
      <div className="sm:col-span-2 pt-1">
        <button
          type="submit"
          disabled={state === "loading"}
          className="brand-button rounded-lg px-6 py-3 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {state === "loading" ? "Sending..." : "Submit Message"}
        </button>
      </div>
      {message ? (
        <p
          className={`sm:col-span-2 text-sm ${
            state === "success" ? "text-emerald-700" : "text-red-600"
          }`}
          role={state === "error" ? "alert" : "status"}
        >
          {message}
        </p>
      ) : null}
    </form>
  );
}
