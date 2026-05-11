/**
 * Category and brand image mappings from assets/images folder
 * All images are located in /public/images/ (static assets served from public folder)
 */

export const CATEGORY_IMAGES = {
  // Main categories
  printers: "/images/printer .png",
  consumables: "/images/parts and toner.jpeg",
  
  // Consumables brands
  canon: "/images/CANON.jpeg",
  ricoh: "/images/ricoh.png",
  
  // Parts and Toners types
  wasteToners: "/images/waste toner bottles.jpeg",
  staples: "/images/staple pins.png",
  toners: "/images/toners.png",
  drumUnits: "/images/drum units.png",
  parts: "/images/copier parts .png",
} as const;

// Type-safe getters for category images
export function getCategoryImage(category: keyof typeof CATEGORY_IMAGES): string {
  return CATEGORY_IMAGES[category];
}
