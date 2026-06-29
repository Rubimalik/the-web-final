export type LocalList = {
  intro?: string;
  items: string[];
  desktopColumns?: 1 | 2;
};

export type LocalModelGroup = {
  title: string;
  models: string[];
  description: string;
  image: {
    src: string;
    alt: string;
    width: number;
    height: number;
  };
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
  modelGroups?: LocalModelGroup[];
  closingParagraphs?: string[];
  variant: LocalSectionVariant;
};

export type LocalFaq = {
  question: string;
  answer: string;
};

export type LocalPageContent = {
  title: string;
  locationName?: string;
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
