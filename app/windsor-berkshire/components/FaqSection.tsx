import { faqs } from "../data";
import AnimatedCard from "./AnimatedCard";
import SectionWrapper from "./SectionWrapper";

export default function FaqSection() {
  return (
    <SectionWrapper
      eyebrow="FAQs"
      title="Frequently Asked Questions"
      intro="Quick answers for Windsor businesses considering refurbished Canon photocopiers, rentals, toners, parts or maintenance."
    >
      <div className="grid gap-3 lg:grid-cols-2">
        {faqs.map((faq, index) => (
          <AnimatedCard
            as="details"
            key={faq.question}
            className="group rounded-lg border border-black/10 bg-white p-5 shadow-sm transition hover:border-[rgba(0,207,255,0.45)] hover:shadow-[0_14px_34px_rgba(0,207,255,0.08)]"
            delay={Math.min(index, 5) * 0.05}
          >
            <summary className="cursor-pointer list-none text-lg font-bold text-black marker:hidden">
              <span className="flex items-start justify-between gap-4">
                {faq.question}
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
