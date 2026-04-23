import { ProductUploadForm } from "@/components/dashboard/ProductUploadForm";
import { getAdminProductCategoryBySlug } from "@/lib/admin-product-categories";

type NewProductPageProps = {
  searchParams: Promise<{
    category?: string | string[] | undefined;
  }>;
};

export default async function NewProductPage({ searchParams }: NewProductPageProps) {
  const resolvedSearchParams = await searchParams;
  const categoryParam = Array.isArray(resolvedSearchParams.category)
    ? resolvedSearchParams.category[0]
    : resolvedSearchParams.category;
  const category = getAdminProductCategoryBySlug(categoryParam);

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-zinc-500 mb-3">
          <span>Products</span>
          {category && (
            <>
              <span>/</span>
              <span>{category.label}</span>
            </>
          )}
          <span>/</span>
          <span className="text-zinc-300">Add Product</span>
        </div>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-white tracking-tight">
              Add Product
            </h1>
            <p className="text-zinc-500 text-sm mt-1">
              {category
                ? `${category.label} is preselected based on the category you opened. You can still change it below.`
                : "Fill in the details below to list a new product in your store."}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              form="product-form"
              type="submit"
              data-submit-intent="draft"
              className="px-4 py-2 text-sm text-zinc-400 hover:text-white border border-zinc-800 hover:border-zinc-600 rounded-lg transition-all duration-200"
            >
              Save Draft
            </button>
            <button
              form="product-form"
              type="submit"
              data-submit-intent="publish"
              className="px-4 py-2 text-sm font-medium bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-all duration-200 shadow-lg shadow-indigo-900/30"
            >
              Publish Product
            </button>
          </div>
        </div>
      </div>

      <ProductUploadForm initialCategorySlug={category?.slug} />
    </div>
  );
}
