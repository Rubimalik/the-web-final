import {
  CircleHelp,
  Mail,
  Phone,
} from "lucide-react";
import Link from "next/link";
import NavBar from "@/components/Navbar";
import SiteFooter from "@/components/SiteFooter";
import AnimatedCard from "./AnimatedCard";
import CheckList from "./CheckList";
import LocalHero from "./LocalHero";
import SectionWrapper from "./SectionWrapper";
import type { LocalContentSection, LocalPageContent } from "./types";

type LocalSeoPageProps = {
  content: LocalPageContent;
};

function LocalSection({ section }: { section: LocalContentSection }) {
  const lightPanel =
    section.variant === "benefits" || section.variant === "coverage" || section.variant === "areas";
  const listPanel =
    section.variant === "why" || section.variant === "coverage" || section.variant === "areas";

  return (
    <SectionWrapper
      eyebrow={section.eyebrow}
      title={section.heading}
      className={lightPanel ? "bg-[rgba(0,207,255,0.045)]" : "bg-[#f7f8fa]"}
    >
      <div className={`space-y-6 rounded-lg border border-black/10 p-5 shadow-sm sm:p-7 ${
        listPanel ? "bg-[#f7f9fb]" : "bg-white"
      }`}>
        {section.paragraphs?.length ? (
          <AnimatedCard className="space-y-4 rounded-lg border border-black/10 bg-[#f7f9fb] p-5 text-base leading-7 text-black/72 shadow-sm sm:p-6 sm:text-lg sm:leading-8">
            {section.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </AnimatedCard>
        ) : null}

        {section.lists?.map((list, listIndex) => (
          <div key={`${section.heading}-${listIndex}`} className="space-y-4">
            {list.intro ? (
              <AnimatedCard
                delay={Math.min(listIndex * 0.05, 0.15)}
                className="flex flex-col gap-3 rounded-lg border border-[rgba(0,207,255,0.24)] bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-6"
              >
                <p className="text-base font-semibold leading-7 text-black/70 sm:text-lg">
                  {list.intro}
                </p>
                <span className="inline-flex h-1 w-14 shrink-0 rounded-full bg-[var(--brand-cyan)]" />
              </AnimatedCard>
            ) : null}
            <CheckList
              items={list.items}
              compact={section.variant === "coverage" || section.variant === "areas"}
              columns={section.variant === "business" ? "two" : "three"}
            />
          </div>
        ))}

        {section.closingParagraphs?.length ? (
          <div className="grid gap-4 rounded-lg border border-black/10 bg-white p-4 shadow-sm sm:p-5">
            {section.closingParagraphs.map((paragraph, index) => (
              <AnimatedCard
                key={paragraph}
                delay={Math.min(index * 0.05, 0.15)}
                className="rounded-lg bg-[#f7f9fb] p-4 text-base leading-7 text-black/72 sm:text-lg sm:leading-8"
              >
                {paragraph}
              </AnimatedCard>
            ))}
          </div>
        ) : null}
      </div>
    </SectionWrapper>
  );
}

function IntroSection({ content }: { content: LocalPageContent }) {
  return (
    <SectionWrapper eyebrow="Local overview" title={content.title} className="bg-[#f7f8fa]">
      <AnimatedCard className="rounded-lg border border-black/10 bg-white p-5 shadow-[0_16px_42px_rgba(15,23,42,0.06)] sm:p-7 lg:p-8">
        <div className="rounded-lg border border-black/10 bg-[#f9fbfc] p-5 sm:p-7">
          <div className="mx-auto max-w-5xl space-y-5 text-base leading-7 text-black/72 sm:text-lg sm:leading-8">
          {content.introParagraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
          </div>
        </div>
      </AnimatedCard>
    </SectionWrapper>
  );
}

function FaqSection({ content }: { content: LocalPageContent }) {
  return (
    <SectionWrapper eyebrow="FAQs" title="Frequently Asked Questions" className="bg-white">
      <div className="grid gap-3 lg:grid-cols-2">
        {content.faqs.map((faq, index) => (
          <AnimatedCard
            as="details"
            key={faq.question}
            delay={Math.min(index * 0.05, 0.25)}
            className="group rounded-lg border border-black/10 bg-white p-5 shadow-sm transition hover:border-[rgba(0,207,255,0.45)] hover:shadow-[0_14px_34px_rgba(0,207,255,0.08)]"
          >
            <summary className="cursor-pointer list-none text-lg font-bold text-black marker:hidden">
              <span className="flex items-start justify-between gap-4">
                <span className="flex items-start gap-3">
                  <CircleHelp className="mt-1 h-4 w-4 shrink-0 text-[var(--brand-cyan)]" aria-hidden="true" />
                  {faq.question}
                </span>
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[rgba(0,207,255,0.1)] text-[var(--brand-cyan)] transition group-open:rotate-45">
                  +
                </span>
              </span>
            </summary>
            <p className="mt-4 border-t border-black/10 pt-4 leading-7 text-black/70">{faq.answer}</p>
          </AnimatedCard>
        ))}
      </div>
    </SectionWrapper>
  );
}

function ContactSection({ content }: { content: LocalPageContent }) {
  return (
    <section className="border-t border-black/10 bg-[#f7f9fb] px-4 py-14 sm:py-20">
      <AnimatedCard className="mx-auto max-w-6xl rounded-lg border border-black/10 bg-white p-6 shadow-[0_18px_48px_rgba(15,23,42,0.08)] sm:p-8 lg:p-10">
        <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
          <div>
            <p className="mb-3 inline-flex rounded-full border border-[rgba(0,207,255,0.3)] bg-white px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-[var(--brand-pink-hover)]">
              Local Canon support
            </p>
            <h2 className="text-3xl font-bold leading-tight text-black sm:text-4xl">
              {content.contact.heading}
            </h2>
            <p className="mt-5 text-lg leading-8 text-black/75">{content.contact.intro}</p>
            <p className="mt-5 text-lg leading-8 text-black/75">{content.contact.closing}</p>
            <p className="mt-5 rounded-lg border border-black/10 bg-[#f7f9fb] p-4 text-base font-bold leading-7 text-black/72">
              {content.contact.details}
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <a href="tel:01753971125" className="brand-button inline-flex items-center justify-center gap-2 rounded-lg px-6 py-3">
                <Phone className="h-4 w-4" />
                Call 01753 971125
              </a>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center rounded-lg border border-black/20 bg-white px-6 py-3 font-bold text-black transition hover:border-[var(--brand-cyan)] hover:text-[var(--brand-pink-hover)]"
              >
                Contact BuySupply
              </Link>
            </div>
          </div>
          <div className="space-y-3 rounded-lg border border-black bg-black p-5 text-white shadow-sm">
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-[var(--brand-cyan)]">
              Contact routes
            </p>
            <a
              href="tel:01753971125"
              className="flex items-center gap-3 rounded-lg border border-white/10 px-3 py-3 font-bold text-white transition hover:border-[rgba(0,207,255,0.42)]"
            >
              <Phone className="h-5 w-5 text-[var(--brand-cyan)]" />
              Phone: 01753 971125
            </a>
            <a
              href="mailto:sales@buysupply.me"
              className="flex items-center gap-3 rounded-lg border border-white/10 px-3 py-3 font-bold text-white transition hover:border-[rgba(0,207,255,0.42)]"
            >
              <Mail className="h-5 w-5 text-[var(--brand-cyan)]" />
              Email: sales@buysupply.me
            </a>
          </div>
        </div>
      </AnimatedCard>
    </section>
  );
}

export default function LocalSeoPage({ content }: LocalSeoPageProps) {
  return (
    <main className="min-h-screen overflow-x-hidden bg-white text-black font-myriad">
      <NavBar />
      <LocalHero title={content.title} />
      <IntroSection content={content} />
      {content.sections.map((section) => (
        <LocalSection key={section.heading} section={section} />
      ))}
      <FaqSection content={content} />
      <ContactSection content={content} />
      <SiteFooter />
    </main>
  );
}
