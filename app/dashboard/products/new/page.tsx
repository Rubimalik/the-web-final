import { ProductUploadForm } from "@/components/dashboard/ProductUploadForm";

export default function NewProductPage() {
  return (
    <div className="max-w-5xl mx-auto">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-zinc-500 mb-3">
          <span>Products</span>
          <span>/</span>
          <span className="text-zinc-300">Add New</span>
        </div>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-white tracking-tight">
              Add New Product
            </h1>
            <p className="text-zinc-500 text-sm mt-1">
              Fill in the details below to list a new product in your store.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button className="px-4 py-2 text-sm text-zinc-400 hover:text-white border border-zinc-800 hover:border-zinc-600 rounded-lg transition-all duration-200">
              Save Draft
            </button>
            <button
              form="product-form"
              type="submit"
              className="px-4 py-2 text-sm font-medium bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-all duration-200 shadow-lg shadow-indigo-900/30"
            >
              Publish Product
            </button>
          </div>
        </div>
      </div>

      <ProductUploadForm />
    </div>
  );
}