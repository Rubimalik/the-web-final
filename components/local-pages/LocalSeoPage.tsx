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
import type { LocalContentSection, LocalModelGroup, LocalPageContent } from "./types";

type LocalSeoPageProps = {
  content: LocalPageContent;
};

const introTimelineIcons = [Building2, UsersRound, BadgeCheck];
const businessSolutionIcons = [Building2, Printer];
const defaultIntroVisual = {
  src: "/images/canon-imagerunner-advance-dx-c3720i-c3725i-c3730i-no-logo.jpeg",
  alt: "",
  width: 918,
  height: 670,
};
const modelShowcaseImages = [
  {
    src: "/images/canon-imagerunner-advance-dx-c259i-c359i-no-extra-logo.png",
    alt: "",
    width: 1402,
    height: 1122,
  },
  defaultIntroVisual,
  {
    src: "/images/canon-imagerunner-advance-dx-c5840-c5860-c5870-no-extra-logo.png",
    alt: "",
    width: 1411,
    height: 1115,
  },
];
const sectionVariantOrder = [
  "models",
  "business",
  "specialist",
  "rental",
  "benefits",
  "parts",
  "coverage",
  "why",
  "areas",
  "export",
];

function ModelShowcaseGroup({
  group,
  index,
}: {
  group: LocalModelGroup;
  index: number;
}) {
  const reverseLayout = index % 2 === 1;

  return (
    <AnimatedCard
      as="article"
      delay={Math.min(index * 0.08, 0.2)}
      className="location-business-card overflow-hidden"
    >
      <div className="grid gap-0 lg:grid-cols-[0.88fr_1.12fr] lg:items-stretch">
        <div
          className={`flex min-h-[18rem] items-center justify-center bg-[#f7f8fa] p-6 sm:p-8 ${
            reverseLayout ? "lg:order-2" : ""
          }`}
        >
          <Image
            src={group.image.src}
            alt={group.image.alt}
            width={group.image.width}
            height={group.image.height}
            className="h-auto max-h-[21rem] w-full object-contain"
            sizes="(min-width: 1024px) 28rem, (min-width: 640px) 70vw, 88vw"
          />
        </div>
        <div className="flex flex-col justify-center p-6 sm:p-8 lg:p-10">
          <h3 className="text-2xl font-bold leading-tight text-black sm:text-3xl">
            {group.title}
          </h3>
          <p className="mt-4 text-base leading-7 text-black/72 sm:text-lg sm:leading-8">
            {group.description}
          </p>
          <ul className="mt-6 grid gap-3 sm:grid-cols-2">
            {group.models.map((model) => (
              <li key={model} className="flex items-start gap-3 text-sm leading-6 text-black/72 sm:text-base">
                <span className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[rgba(0,207,255,0.1)]">
                  <CheckCircle2 className="h-4 w-4 text-[var(--brand-cyan)]" aria-hidden="true" />
                </span>
                <span>{model}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </AnimatedCard>
  );
}

function ModelShowcaseList({
  list,
  index,
  sectionHeading,
}: {
  list: NonNullable<LocalContentSection["lists"]>[number];
  index: number;
  sectionHeading: string;
}) {
  const reverseLayout = index % 2 === 1;
  const image = modelShowcaseImages[index % modelShowcaseImages.length];

  return (
    <AnimatedCard
      as="article"
      delay={Math.min(index * 0.08, 0.2)}
      className="location-business-card overflow-hidden"
    >
      <div className="grid gap-0 lg:grid-cols-[0.88fr_1.12fr] lg:items-stretch">
        <div
          className={`flex min-h-[18rem] items-center justify-center bg-[#f7f8fa] p-6 sm:p-8 ${
            reverseLayout ? "lg:order-2" : ""
          }`}
        >
          <Image
            src={image.src}
            alt={image.alt}
            width={image.width}
            height={image.height}
            className="h-auto max-h-[21rem] w-full object-contain"
            sizes="(min-width: 1024px) 28rem, (min-width: 640px) 70vw, 88vw"
          />
        </div>
        <div className="flex flex-col justify-center p-6 sm:p-8 lg:p-10">
          <h3 className="text-2xl font-bold leading-tight text-black sm:text-3xl">
            {list.intro ?? sectionHeading}
          </h3>
          <ul className="mt-6 grid gap-3 sm:grid-cols-2">
            {list.items.map((item) => (
              <li key={item} className="flex items-start gap-3 text-sm leading-6 text-black/72 sm:text-base">
                <span className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[rgba(0,207,255,0.1)]">
                  <CheckCircle2 className="h-4 w-4 text-[var(--brand-cyan)]" aria-hidden="true" />
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </AnimatedCard>
  );
}

export function ModelShowcaseSection({ section }: { section: LocalContentSection }) {
  const heading = "Canon imageRUNNER ADVANCE DX Office Photocopiers";

  return (
    <SectionWrapper eyebrow={section.eyebrow} title={heading} className="bg-[#f7f8fa]">
      <div className="mx-auto max-w-[76rem] space-y-9 lg:space-y-10">
        {section.paragraphs?.length ? (
          <AnimatedCard className="max-w-5xl space-y-4 border-l-2 border-[rgba(8,122,193,0.16)] pl-5 text-base leading-7 text-black/72 sm:pl-7 sm:text-lg sm:leading-8">
            {section.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </AnimatedCard>
        ) : null}

        <div className="space-y-6">
          {section.modelGroups?.map((group, index) => (
            <ModelShowcaseGroup key={group.title} group={group} index={index} />
          ))}
          {!section.modelGroups?.length
            ? section.lists?.map((list, index) => (
                <ModelShowcaseList
                  key={`${section.heading}-${list.intro ?? index}`}
                  list={list}
                  index={index}
                  sectionHeading={heading}
                />
              ))
            : null}
        </div>

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
                  <ul className={`mt-5 grid gap-3 ${list.desktopColumns === 2 ? "lg:grid-cols-2" : ""}`}>
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

export function LocalSection({ section }: { section: LocalContentSection }) {
  if (section.variant === "models") {
    return <ModelShowcaseSection section={section} />;
  }

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

export function IntroSection({ content }: { content: LocalPageContent }) {
  const introVisual = content.introVisual ?? defaultIntroVisual;
  const heading = content.locationName
    ? `Refurbished Canon Photocopiers & Canon Office Printers in ${content.locationName}`
    : content.title;
  const introGridClass =
    "md:grid-cols-[minmax(0,1.05fr)_minmax(20rem,0.95fr)] lg:grid-cols-[minmax(0,1.02fr)_minmax(24rem,0.98fr)]";

  return (
    <SectionWrapper eyebrow="Local overview" title={heading} className="bg-[#f7f8fa]">
      <AnimatedCard className="local-overview-open p-1 sm:p-2">
        <div className={`grid gap-8 p-1 sm:p-2 md:items-center lg:gap-8 ${introGridClass}`}>
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
            className="relative mx-auto flex w-full max-w-[30rem] items-center justify-center md:max-w-[34rem] lg:max-w-[38rem]"
          >
            <Image
              src={introVisual.src}
              alt={introVisual.alt}
              width={introVisual.width}
              height={introVisual.height}
              unoptimized
              className="h-auto w-full object-contain"
              sizes="(min-width: 1024px) 32rem, (min-width: 768px) 27rem, 92vw"
            />
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
  const sections = [...content.sections].sort(
    (first, second) =>
      sectionVariantOrder.indexOf(first.variant) - sectionVariantOrder.indexOf(second.variant),
  );

  return (
    <main className="local-location-page min-h-screen overflow-x-hidden bg-white text-black font-myriad">
      <NavBar />
      <LocalHero title={content.title} />
      <IntroSection content={content} />
      {sections.map((section) => (
        <LocalSection key={section.heading} section={section} />
      ))}
      <FaqSection content={content} />
      <ContactSection content={content} />
      <SiteFooter />
    </main>
  );
}
