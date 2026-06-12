import type { LocalModelGroup } from "./types";

export function createCanonAdvanceDxModelGroups(locationName: string): LocalModelGroup[] {
  return [
  {
    title: "Compact / Home Office Canon Models",
    description:
      "These smaller Canon imageRUNNER ADVANCE DX models are well suited to home offices, remote workers, hybrid workers, people working from home and smaller offices that still need dependable print, copy and scan performance.",
    image: {
      src: "/images/canon-imagerunner-advance-dx-c259i-c359i-no-extra-logo.png",
      alt: "Canon imageRUNNER ADVANCE DX C259i and C359i compact copier for home offices and remote workers",
      width: 1402,
      height: 1122,
    },
    models: [
      "Canon imageRUNNER ADVANCE DX C257i",
      "Canon imageRUNNER ADVANCE DX C357i",
      "Canon imageRUNNER ADVANCE DX C259i",
      "Canon imageRUNNER ADVANCE DX C359i",
    ],
  },
  {
    title: "Mid-Range Office Canon Models",
    description: `A practical choice for established ${locationName} offices that need reliable Canon multifunction printing, professional colour output, fast scanning and everyday document workflows.`,
    image: {
      src: "/images/canon-imagerunner-advance-dx-c3720i-c3725i-c3730i-no-logo.jpeg",
      alt: "Canon imageRUNNER ADVANCE DX C3725i and C3730i office photocopier",
      width: 918,
      height: 670,
    },
    models: [
      "Canon imageRUNNER ADVANCE DX C3725i",
      "Canon imageRUNNER ADVANCE DX C3730i",
      "Canon imageRUNNER ADVANCE DX C3822i",
      "Canon imageRUNNER ADVANCE DX C3830i",
      "Canon imageRUNNER ADVANCE DX 4735i",
    ],
  },
  {
    title: "High-Volume Business Canon Models",
    description:
      "These larger Canon multifunction devices are designed for busier departments, professional offices and high-volume business environments that need stronger capacity and consistent output.",
    image: {
      src: "/images/canon-imagerunner-advance-dx-c5840-c5860-c5870-no-extra-logo.png",
      alt: "Canon imageRUNNER ADVANCE DX C5840, C5860 and C5870 high-volume business copier",
      width: 1411,
      height: 1115,
    },
    models: [
      "Canon imageRUNNER ADVANCE DX C5735i",
      "Canon imageRUNNER ADVANCE DX C5740i",
      "Canon imageRUNNER ADVANCE DX C5750i",
      "Canon imageRUNNER ADVANCE DX C5860i",
    ],
  },
  ];
}
