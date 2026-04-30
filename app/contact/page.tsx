import type { Metadata } from "next";
import NavBar from "@/components/Navbar";
import SiteFooter from "@/components/SiteFooter";
import { Clock3, Mail, MapPin, Phone } from "lucide-react";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Contact BuySupply for photocopier and printer sales, rental, leasing, collection, and export enquiries.",
  alternates: {
    canonical: "/contact",
  },
};

const inputClass =
  "w-full rounded-lg border border-black/15 bg-white px-4 py-3 text-sm text-black placeholder:text-black/45 focus:border-[var(--brand-cyan)] focus:outline-none";

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-white text-black font-myriad">
      <NavBar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <section className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold brand-title">
            Contact Us
          </h1>
          <p className="mt-4 text-black/70 text-sm sm:text-base leading-relaxed">
            Speak with our team about buying, selling, renting, or exporting
            photocopiers and printer equipment. We respond promptly with clear,
            practical guidance.
          </p>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-10">
          <div className="lg:col-span-3 brand-surface rounded-2xl p-5 sm:p-7">
            <h2 className="text-2xl font-bold brand-title mb-6">Send Us a Message</h2>
            <form className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
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
                <button type="submit" className="brand-button rounded-lg px-6 py-3">
                  Submit Message
                </button>
              </div>
            </form>
          </div>

          <div className="lg:col-span-2 brand-surface rounded-2xl p-5 sm:p-7">
            <h2 className="text-2xl font-bold brand-title mb-6">Business Details</h2>
            <div className="space-y-5 text-sm sm:text-base">
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 mt-0.5 shrink-0 brand-icon" />
                <div>
                  <p className="text-black/45 uppercase tracking-widest text-xs mb-1">
                    Address
                  </p>
                  <p className="text-black/80">
                    Slough Trading Estate, Slough, United Kingdom
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="h-5 w-5 mt-0.5 shrink-0 brand-icon" />
                <div>
                  <p className="text-black/45 uppercase tracking-widest text-xs mb-1">
                    Phone
                  </p>
                  <a
                    href="tel:01753971125"
                    className="text-black/80 hover:text-[var(--brand-pink-hover)] transition-colors"
                  >
                    01753 971125
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 mt-0.5 shrink-0 brand-icon" />
                <div>
                  <p className="text-black/45 uppercase tracking-widest text-xs mb-1">
                    Email
                  </p>
                  <a
                    href="mailto:sales@buysupply.me"
                    className="text-black/80 hover:text-[var(--brand-pink-hover)] transition-colors"
                  >
                    sales@buysupply.me
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock3 className="h-5 w-5 mt-0.5 shrink-0 brand-icon" />
                <div>
                  <p className="text-black/45 uppercase tracking-widest text-xs mb-1">
                    Working Hours
                  </p>
                  <p className="text-black/80">Mon - Fri: 9:00 AM - 5:30 PM</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-8 sm:mt-10 brand-surface rounded-2xl p-2 sm:p-3">
          <iframe
            title="BuySupply Location Map"
            src="https://www.google.com/maps?q=Slough+Trading+Estate,+Slough,+UK&output=embed"
            className="w-full h-[300px] sm:h-[360px] rounded-xl border-0"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
