export type LocalList = {
  intro?: string;
  items: string[];
};

export type LocalSectionVariant =
  | "models"
  | "business"
  | "rental"
  | "benefits"
  | "parts"
  | "coverage"
  | "why"
  | "export"
  | "areas"
  | "specialist";

export type LocalContentSection = {
  eyebrow: string;
  heading: string;
  paragraphs?: string[];
  lists?: LocalList[];
  closingParagraphs?: string[];
  variant: LocalSectionVariant;
};

export type LocalFaq = {
  question: string;
  answer: string;
};

export type LocalPageContent = {
  title: string;
  introParagraphs: string[];
  introVisual?: {
    src: string;
    alt: string;
    width: number;
    height: number;
  };
  sections: LocalContentSection[];
  faqs: LocalFaq[];
  contact: {
    heading: string;
    intro: string;
    details: string;
    closing: string;
  };
};
