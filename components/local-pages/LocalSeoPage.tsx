import {
  BadgeCheck,
  Building2,
  CheckCircle2,
  Phone,
  Printer,
  UsersRound,
} from "lucide-react";
import Image from "next/image";
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

const introTimelineIcons = [Building2, UsersRound, BadgeCheck];
const businessSolutionIcons = [Building2, Printer];

function BusinessSolutionsSection({ section }: { section: LocalContentSection }) {
  return (
    <SectionWrapper
      eyebrow={section.eyebrow}
      title={section.heading}
      className="location-business-solutions"
    >
      <div className="mx-auto max-w-[76rem]">
        {section.paragraphs?.length ? (
          <AnimatedCard className="mx-auto max-w-4xl space-y-4 text-center text-base leading-7 text-black/72 sm:text-lg sm:leading-8">
            {section.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </AnimatedCard>
        ) : null}

        {section.lists?.length ? (
          <div className="mt-10 grid gap-6 lg:grid-cols-2 lg:gap-8">
            {section.lists.map((list, index) => {
              const Icon = businessSolutionIcons[index % businessSolutionIcons.length];

              return (
                <AnimatedCard
                  as="article"
                  key={`${section.heading}-${list.intro ?? index}`}
                  delay={Math.min(index * 0.08, 0.18)}
                  className="location-business-card flex h-full flex-col p-6 sm:p-8"
                >
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[rgba(0,207,255,0.12)] text-[#00cfff]">
                    <Icon className="h-6 w-6" aria-hidden="true" />
                  </span>
                  {list.intro ? (
                    <h3 className="mt-6 text-2xl font-bold leading-tight text-black">
                      {list.intro}
                    </h3>
                  ) : null}
                  <ul className="mt-5 grid gap-3">
                    {list.items.map((item) => (
                      <li
                        key={item}
                        className="location-point-card flex items-start gap-3 text-base leading-7 text-black/72"
                      >
                        <CheckCircle2
                          className="mt-1 h-4 w-4 shrink-0 text-[#00cfff]"
                          aria-hidden="true"
                        />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </AnimatedCard>
              );
            })}
          </div>
        ) : null}

        {section.closingParagraphs?.length ? (
          <div className="mx-auto mt-8 grid max-w-4xl gap-4 text-center">
            {section.closingParagraphs.map((paragraph, index) => (
              <AnimatedCard
                key={paragraph}
                delay={Math.min(index * 0.05, 0.15)}
                className="text-base leading-7 text-black/72 sm:text-lg sm:leading-8"
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

function LocalSection({ section }: { section: LocalContentSection }) {
  if (section.variant === "business") {
    return <BusinessSolutionsSection section={section} />;
  }

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
      <div className={`space-y-9 lg:space-y-10 ${listPanel ? "mx-auto max-w-6xl" : "mx-auto max-w-[68rem]"}`}>
        {section.paragraphs?.length ? (
          <AnimatedCard className="max-w-5xl space-y-4 border-l-2 border-[rgba(8,122,193,0.16)] pl-5 text-base leading-7 text-black/72 sm:pl-7 sm:text-lg sm:leading-8">
            {section.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </AnimatedCard>
        ) : null}

        {section.lists?.map((list, listIndex) => (
          <div key={`${section.heading}-${listIndex}`} className="space-y-5">
            {list.intro ? (
              <AnimatedCard
                delay={Math.min(listIndex * 0.05, 0.15)}
                className="flex flex-col gap-3 pb-5 sm:flex-row sm:items-center sm:justify-between"
              >
                <p className="text-base font-semibold leading-7 text-black/70 sm:text-lg">
                  {list.intro}
                </p>
              </AnimatedCard>
            ) : null}
            <CheckList
              items={list.items}
              compact={section.variant === "coverage" || section.variant === "areas"}
              columns="three"
              boxed={section.variant === "models"}
            />
          </div>
        ))}

        {section.closingParagraphs?.length ? (
          <div className="grid gap-4">
            {section.closingParagraphs.map((paragraph, index) => (
              <AnimatedCard
                key={paragraph}
                delay={Math.min(index * 0.05, 0.15)}
                className="border-l-2 border-[color-mix(in_srgb,var(--brand-pink-hover)_14%,transparent)] pl-5 text-base leading-7 text-black/72 sm:pl-6 sm:text-lg sm:leading-8"
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
      <AnimatedCard className="local-overview-open p-1 sm:p-2">
        <div className="grid gap-8 p-1 sm:p-2 md:grid-cols-[minmax(0,1.34fr)_minmax(15rem,0.72fr)] md:items-center lg:grid-cols-[minmax(0,1.46fr)_minmax(18rem,0.74fr)] lg:gap-8">
          <div className="space-y-0 text-base leading-7 text-black/76 sm:text-[1.0625rem] sm:leading-8">
            {content.introParagraphs.map((paragraph, index) => {
              const Icon = introTimelineIcons[index % introTimelineIcons.length];

              return (
                <AnimatedCard
                  key={paragraph}
                  delay={Math.min(index * 0.08, 0.2)}
                  className="local-overview-timeline group relative grid grid-cols-[3rem_minmax(0,1fr)] gap-3 py-4 sm:grid-cols-[4.25rem_minmax(0,1fr)] sm:gap-5 sm:py-4"
                >
                  <span className="relative flex justify-center">
                    <span className="local-overview-icon flex h-12 w-12 items-center justify-center rounded-full border bg-white shadow-[0_12px_30px_rgba(8,122,193,0.12)] sm:h-14 sm:w-14">
                      <Icon className="h-6 w-6" aria-hidden="true" />
                    </span>
                  </span>
                  <p className="self-center">{paragraph}</p>
                </AnimatedCard>
              );
            })}
          </div>

          <AnimatedCard
            delay={0.16}
            className="local-overview-printer relative mx-auto flex min-h-[17rem] w-full max-w-[24rem] items-end justify-center px-4 pb-0 pt-7 sm:min-h-[21rem] md:min-h-[22rem] md:px-2 lg:min-h-[25rem] lg:px-5"
          >
            <span className="local-overview-dots absolute left-1 top-[18%] h-32 w-28" aria-hidden="true" />
            <span className="absolute inset-x-2 bottom-4 top-4 rounded-full bg-[rgba(220,242,255,0.76)]" aria-hidden="true" />
            <Image
              src="/images/canon-copier-cutout-balanced.png"
              alt="Canon imageRUNNER ADVANCE DX copier product"
              width={980}
              height={1178}
              className="relative z-10 h-auto max-h-[19.5rem] w-auto max-w-[94%] object-contain drop-shadow-[0_24px_28px_rgba(8,32,56,0.18)] sm:max-h-[22.5rem] lg:max-h-[24.5rem]"
            />
            <span className="absolute bottom-2 left-4 right-4 z-20 rounded-lg border border-black/10 bg-white/95 px-4 py-3 text-left shadow-[0_18px_38px_rgba(8,32,56,0.14)] sm:bottom-4 sm:left-auto sm:right-2 sm:w-[15rem]">
              <span className="block text-sm font-bold leading-5 text-black">
                imageRUNNER Advance DX
              </span>
              <span className="mt-1 block text-xs font-semibold leading-5 text-black/60">
                C3720i / C3725i / C3730i
              </span>
            </span>
          </AnimatedCard>
        </div>

      </AnimatedCard>
    </SectionWrapper>
  );
}

function FaqSection({ content }: { content: LocalPageContent }) {
  return (
    <SectionWrapper eyebrow="FAQs" title="Frequently Asked Questions" className="location-faq-section">
      <div className="location-faq-list mx-auto max-w-[76rem]">
        {content.faqs.map((faq, index) => (
          <AnimatedCard
            as="details"
            key={faq.question}
            delay={Math.min(index * 0.05, 0.25)}
            className="location-faq-item group"
          >
            <summary className="location-faq-question">
              <span>{faq.question}</span>
              <span className="location-faq-toggle" aria-hidden="true" />
            </summary>
            <div className="location-faq-answer">
              <p>{faq.answer}</p>
            </div>
          </AnimatedCard>
        ))}
      </div>
    </SectionWrapper>
  );
}

function ContactSection({ content }: { content: LocalPageContent }) {
  return (
    <section className="local-section-shell px-5 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
      <div className="mx-auto flex min-h-[28rem] max-w-[1180px] items-center justify-center">
        <AnimatedCard className="w-full">
          <div className="mx-auto flex max-w-[780px] flex-col items-center text-center">
            <h2 className="text-4xl font-bold leading-tight text-[#00cfff] sm:text-5xl lg:text-[2.75rem]">
              {content.contact.heading}
            </h2>
            <span className="mb-6 mt-5 block h-1 w-24 rounded-full bg-[var(--brand-pink-hover)] sm:mb-7" />
            <p className="mt-6 text-lg leading-8 text-black/75 sm:text-xl">{content.contact.intro}</p>
            <p className="mt-6 text-lg leading-8 text-black/75 sm:text-xl">{content.contact.closing}</p>
            <div className="mt-8 flex w-full flex-col items-center justify-center gap-3 sm:w-auto sm:flex-row sm:gap-4">
              <a
                href="tel:01753971125"
                className="brand-button inline-flex w-full max-w-[18rem] items-center justify-center gap-2 rounded-lg px-6 py-3 sm:w-auto sm:max-w-none"
              >
                <Phone className="h-4 w-4" />
                Call 01753 971125
              </a>
              <Link
                href="/contact"
                className="inline-flex w-full max-w-[18rem] items-center justify-center rounded-lg border border-black/20 bg-white px-6 py-3 font-bold text-black transition hover:border-[var(--brand-pink-hover)] hover:text-[var(--brand-pink-hover)] sm:w-auto sm:max-w-none"
              >
                Contact BuySupply
              </Link>
            </div>
          </div>
        </AnimatedCard>
      </div>
    </section>
  );
}

export default function LocalSeoPage({ content }: LocalSeoPageProps) {
  return (
    <main className="local-location-page min-h-screen overflow-x-hidden bg-white text-black font-myriad">
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
