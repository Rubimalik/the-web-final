export const PRODUCT_IMAGE_PLACEHOLDER_KEY =
  "products/placeholders/source-logo.png";

export function getProductImagePlaceholderUrl() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (!supabaseUrl) {
    return "/logo.png";
  }

  return `${supabaseUrl}/storage/v1/object/public/product-images/${PRODUCT_IMAGE_PLACEHOLDER_KEY}`;
}
