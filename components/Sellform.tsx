"use client"

import { useState, useRef, useEffect } from "react"
import { safeReadJsonResponse } from "@/lib/safe-json"

type FormState = "idle" | "loading" | "success" | "error"

const inputClass = `bg-[#f5f5f5] border border-black/30 rounded-sm px-4 py-3.5 text-black placeholder-black/45
  focus:outline-none focus:border-[var(--brand-cyan)] focus:bg-white
  transition-all duration-200 text-sm w-full`

const labelClass = "text-black/70 text-xs uppercase tracking-widest"

// ── Custom Dropdown ──────────────────────────────────────────────
interface DropdownProps {
  id: string
  name: string
  required?: boolean
  placeholder: string
  options: { label: string; value: string }[]
  value: string
  onChange: (value: string) => void
}

function CustomDropdown({ id, name, required, placeholder, options, value, onChange }: DropdownProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  const selected = options.find(o => o.value === value)

  return (
    <div ref={ref} className="relative w-full" >
      {/* Hidden native input for form submission */}
      <input type="hidden" id={id} name={name} value={value} required={required} />

      {/* Trigger button */}
      <button
        type="button"
        onClick={() => setOpen(prev => !prev)}
        className={`
          w-full flex items-center justify-between
          bg-[#f5f5f5] border rounded-sm px-4 py-3.5 text-sm
          transition-all duration-200 text-left
          ${open
            ? "border-[var(--brand-cyan)] bg-white"
            : "border-black/30 hover:border-black/50"
          }
        `}
      >
        <span className={selected ? "text-black" : "text-black/45"}>
          {selected ? selected.label : placeholder}
        </span>

        {/* Animated chevron */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="14" height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`text-black/50 shrink-0 transition-transform duration-300 ${open ? "rotate-180" : "rotate-0"}`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {/* Animated options panel */}
      <div
        className={`
          absolute z-50 left-0 right-0 mt-2
          bg-white border border-black/20 rounded-sm
          overflow-hidden shadow-[0_16px_48px_rgba(0,0,0,0.6)]
          transition-all duration-200 origin-top
          ${open
            ? "opacity-100 scale-y-100 translate-y-0 pointer-events-auto"
            : "opacity-0 scale-y-95 -translate-y-1 pointer-events-none"
          }
        `}
      >
        {options.map((opt, i) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => { onChange(opt.value); setOpen(false) }}
            className={`
              w-full text-left px-4 py-3 text-sm
              transition-all duration-150
              flex items-center justify-between
              ${i !== 0 ? "border-t border-black/[0.08]" : ""}
              ${value === opt.value
                ? "bg-cyan-50 text-black"
                : "text-black/75 hover:bg-black/[0.04] hover:text-black"
              }
            `}
          >
            <span className="capitalize">{opt.label}</span>

            {/* Checkmark for selected */}
            {value === opt.value && (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="13" height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-black/60"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}

// ── Main Form ────────────────────────────────────────────────────
export default function SellForm() {
  const [state, setState] = useState<FormState>("idle")
  const [errorMsg, setErrorMsg] = useState("")
  const [condition, setCondition] = useState("")
  const [status, setStatus] = useState("")

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setState("loading")
    setErrorMsg("")

    const form = e.currentTarget
    const get = (name: string) =>
      (form.elements.namedItem(name) as HTMLInputElement | HTMLTextAreaElement)?.value

    const data = {
      make:        get("make"),
      productType: get("productType"),
      model:       get("model"),
      quantity:    get("quantity"),
      condition,
      status,
      notes:       get("notes"),
      name:        get("name"),
      company:     get("company"),
      email:       get("email"),
      phone:       get("phone"),
    }

    try {
      const res = await fetch("/api/sell-enquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!res.ok) {
        const json = await safeReadJsonResponse<{ error?: string }>(
          res,
          "SellForm submit enquiry"
        )
        throw new Error(json?.error || "Something went wrong")
      }

      setState("success")
      form.reset()
      setCondition("")
      setStatus("")
    } catch (err: unknown) {
      setState("error")
      setErrorMsg(err instanceof Error ? err.message : "Failed to send. Please try again.")
    }
  }

  return (
    <div className="border-t border-black/10 mt-16 pt-16" id="sell-form">
      <h2 className="text-3xl md:text-4xl font-bold mb-3 text-center brand-title">
        Sell Your Equipment
      </h2>
      <p className="brand-pink text-center mb-10">
        Fill in the form below and our team will get back to you with a quote.
      </p>

      {state === "success" ? (
        <div className="max-w-xl mx-auto text-center bg-white border border-black/15 rounded-xl px-8 py-12">
          <div className="text-4xl mb-4">✅</div>
          <h3 className="text-xl font-semibold mb-2">Enquiry Received</h3>
          <p className="text-black/65">
            Thank you — our team will review your details and be in touch shortly.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto flex flex-col gap-9">

          {/* ── Equipment Details ── */}
          <div className="flex flex-col gap-6">
            <p className="text-black/45 text-xs uppercase tracking-[3px]">Equipment Details</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="make" className={labelClass}>
                  Make <span className="text-black/45">*</span>
                </label>
                <input id="make" name="make" type="text" required
                  placeholder="e.g. Ricoh, Canon, Konica" className={inputClass} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="productType" className={labelClass}>
                  Product Type <span className="text-black/45">(optional)</span>
                </label>
                <input id="productType" name="productType" type="text"
                  placeholder="e.g. MFP, Printer, Scanner" className={inputClass} />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="model" className={labelClass}>
                  Model <span className="text-black/45">*</span>
                </label>
                <input id="model" name="model" type="text" required
                  placeholder="e.g. IM C3000" className={inputClass} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="quantity" className={labelClass}>
                  Quantity <span className="text-black/45">*</span>
                </label>
                <input id="quantity" name="quantity" type="number" required min={1}
                  placeholder="1" className={inputClass} />
              </div>
            </div>

            {/* Dropdowns */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="flex flex-col gap-1.5">
                <label className={labelClass}>
                  Condition <span className="text-black/45">*</span>
                </label>
                <CustomDropdown
                  id="condition" name="condition" required
                  placeholder="Select condition"
                  value={condition} onChange={setCondition}
                  options={[
                    { label: "New",         value: "new"         },
                    { label: "Refurbished", value: "refurbished" },
                    { label: "Good",        value: "good"        },
                    { label: "Fair",        value: "fair"        },
                    { label: "Poor",        value: "poor"        },
                  ]}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className={labelClass}>
                  Status <span className="text-black/45">*</span>
                </label>
                <CustomDropdown
                  id="status" name="status" required
                  placeholder="Select status"
                  value={status} onChange={setStatus}
                  options={[
                    { label: "Working",     value: "working"     },
                    { label: "Not Working", value: "not working" },
                    { label: "Parts Only",  value: "parts only"  },
                    { label: "Unknown",     value: "unknown"     },
                  ]}
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="notes" className={labelClass}>
                Message <span className="text-black/45">(optional)</span>
              </label>
              <textarea id="notes" name="notes" rows={7}
                placeholder="e.g. Low meter count, original packaging, collected from site..."
                className={`${inputClass} resize-none`} />
            </div>
          </div>

          <div className="border-t border-black/10" />

          {/* ── Contact Details ── */}
          <div className="flex flex-col gap-6">
            <p className="text-black/45 text-xs uppercase tracking-[3px]">Contact Details</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="name" className={labelClass}>
                  Full Name <span className="text-black/45">*</span>
                </label>
                <input id="name" name="name" type="text" required
                  placeholder="John Smith" className={inputClass} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="company" className={labelClass}>
                  Company <span className="text-black/45">(optional)</span>
                </label>
                <input id="company" name="company" type="text"
                  placeholder="Acme Ltd" className={inputClass} />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="email" className={labelClass}>
                  Email <span className="text-black/45">*</span>
                </label>
                <input id="email" name="email" type="email" required
                  placeholder="john@example.com" className={inputClass} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="phone" className={labelClass}>
                  Phone <span className="text-black/45">*</span>
                </label>
                <input id="phone" name="phone" type="tel" required
                  placeholder="07700 900000" className={inputClass} />
              </div>
            </div>
          </div>

          {state === "error" && (
            <p className="text-red-400 text-sm text-center">{errorMsg}</p>
          )}

          <button
            type="submit"
            disabled={state === "loading"}
            className="w-full brand-button py-3.5 rounded-lg
                       transition-all duration-300
                       hover:shadow-[0_0_24px_rgba(181,14,97,0.24)] hover:scale-[1.01]
                       active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed
                       text-sm tracking-wide"
          >
            {state === "loading" ? "Sending…" : "Submit Enquiry"}
          </button>

          <p className="text-black/45 text-xs text-center">
            We&apos;ll respond within 1 business day.
          </p>
        </form>
      )}
    </div>
  )
}