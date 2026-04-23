"use client"

import { useState, useRef, useEffect } from "react"

type FormState = "idle" | "loading" | "success" | "error"

const inputClass = `bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/20
  focus:outline-none focus:border-white/30 focus:bg-white/[0.08]
  transition-all duration-200 text-sm w-full`

const labelClass = "text-white/50 text-xs uppercase tracking-widest"

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
          bg-white/5 border rounded-lg px-4 py-3 text-sm
          transition-all duration-200 text-left
          ${open
            ? "border-white/30 bg-white/[0.08]"
            : "border-white/10 hover:border-white/20 hover:bg-white/[0.07]"
          }
        `}
      >
        <span className={selected ? "text-white" : "text-white/20"}>
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
          className={`text-white/40 shrink-0 transition-transform duration-300 ${open ? "rotate-180" : "rotate-0"}`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {/* Animated options panel */}
      <div
        className={`
          absolute z-50 left-0 right-0 mt-2
          bg-[#111] border border-white/10 rounded-lg
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
              ${i !== 0 ? "border-t border-white/[0.06]" : ""}
              ${value === opt.value
                ? "bg-white/10 text-white"
                : "text-white/60 hover:bg-white/5 hover:text-white"
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
                className="text-white/60"
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
        const json = await res.json()
        throw new Error(json.error || "Something went wrong")
      }

      setState("success")
      form.reset()
      setCondition("")
      setStatus("")
    } catch (err: any) {
      setState("error")
      setErrorMsg(err.message || "Failed to send. Please try again.")
    }
  }

  return (
    <div className="border-t border-white/10 mt-16 pt-16" id="sell-form">
      <h2 className="text-3xl md:text-4xl font-bold mb-3 text-center">
        Sell Your Equipment
      </h2>
      <p className="text-white/60 text-center mb-10">
        Fill in the form below and our team will get back to you with a quote.
      </p>

      {state === "success" ? (
        <div className="max-w-xl mx-auto text-center bg-white/5 border border-white/10 rounded-xl px-8 py-12">
          <div className="text-4xl mb-4">✅</div>
          <h3 className="text-xl font-semibold mb-2">Enquiry Received</h3>
          <p className="text-white/60">
            Thank you — our team will review your details and be in touch shortly.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto flex flex-col gap-8">

          {/* ── Equipment Details ── */}
          <div className="flex flex-col gap-5">
            <p className="text-white/40 text-xs uppercase tracking-[3px]">Equipment Details</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="make" className={labelClass}>
                  Make <span className="text-white/30">*</span>
                </label>
                <input id="make" name="make" type="text" required
                  placeholder="e.g. Ricoh, Canon, Konica" className={inputClass} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="productType" className={labelClass}>
                  Product Type <span className="text-white/30">(optional)</span>
                </label>
                <input id="productType" name="productType" type="text"
                  placeholder="e.g. MFP, Printer, Scanner" className={inputClass} />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="model" className={labelClass}>
                  Model <span className="text-white/30">*</span>
                </label>
                <input id="model" name="model" type="text" required
                  placeholder="e.g. IM C3000" className={inputClass} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="quantity" className={labelClass}>
                  Quantity <span className="text-white/30">*</span>
                </label>
                <input id="quantity" name="quantity" type="number" required min={1}
                  placeholder="1" className={inputClass} />
              </div>
            </div>

            {/* Dropdowns */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="flex flex-col gap-1.5">
                <label className={labelClass}>
                  Condition <span className="text-white/30">*</span>
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
                  Status <span className="text-white/30">*</span>
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
                Additional Notes <span className="text-white/30">(optional)</span>
              </label>
              <textarea id="notes" name="notes" rows={4}
                placeholder="e.g. Low meter count, original packaging, collected from site..."
                className={`${inputClass} resize-none`} />
            </div>
          </div>

          <div className="border-t border-white/10" />

          {/* ── Contact Details ── */}
          <div className="flex flex-col gap-5">
            <p className="text-white/40 text-xs uppercase tracking-[3px]">Contact Details</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="name" className={labelClass}>
                  Full Name <span className="text-white/30">*</span>
                </label>
                <input id="name" name="name" type="text" required
                  placeholder="John Smith" className={inputClass} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="company" className={labelClass}>
                  Company <span className="text-white/30">(optional)</span>
                </label>
                <input id="company" name="company" type="text"
                  placeholder="Acme Ltd" className={inputClass} />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="email" className={labelClass}>
                  Email <span className="text-white/30">*</span>
                </label>
                <input id="email" name="email" type="email" required
                  placeholder="john@example.com" className={inputClass} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="phone" className={labelClass}>
                  Phone <span className="text-white/30">*</span>
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
            className="w-full bg-white text-black font-semibold py-3.5 rounded-lg
                       transition-all duration-300
                       hover:bg-white/90 hover:shadow-[0_0_24px_rgba(255,255,255,0.12)] hover:scale-[1.01]
                       active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed
                       text-sm tracking-wide"
          >
            {state === "loading" ? "Sending…" : "Submit Enquiry"}
          </button>

          <p className="text-white/30 text-xs text-center">
            We'll respond within 1 business day.
          </p>
        </form>
      )}
    </div>
  )
}