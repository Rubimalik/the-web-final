import Link from "next/link";
import { ArrowRight, Package } from "lucide-react";
import { getDashboardOverview } from "@/lib/catalog-store";
import { getProductImagePlaceholderUrl } from "@/lib/product-image-placeholder";

export const dynamic = "force-dynamic";

const STATUS_STYLES = {
  active: "bg-emerald-500/15 text-emerald-400 border-emerald-500/25",
  draft: "bg-zinc-500/15 text-zinc-300 border-zinc-500/25",
  archived: "bg-amber-500/15 text-amber-400 border-amber-500/25",
} as const;

export default async function DashboardPage() {
  const {
    totalProducts,
    activeProducts,
    draftProducts,
    totalCategories,
    recentProducts,
  } = await getDashboardOverview();

  const stats = [
    { label: "Total Products", value: totalProducts, tone: "text-white" },
    { label: "Active", value: activeProducts, tone: "text-emerald-400" },
    { label: "Draft", value: draftProducts, tone: "text-zinc-300" },
    { label: "Categories", value: totalCategories, tone: "text-indigo-300" },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-10">
      <div>
        <div>
          <h1 className="text-2xl font-semibold text-white tracking-tight">Overview</h1>
          <p className="text-zinc-500 text-sm mt-1">
            Quick view of your catalogue and the latest product updates.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-[#13131a] border border-zinc-800/70 rounded-xl px-4 py-4"
          >
            <p className="text-xs text-zinc-500 mb-2">{stat.label}</p>
            <p className={`text-2xl font-semibold ${stat.tone}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6">
        <section className="bg-[#13131a] border border-zinc-800/70 rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-zinc-800/70">
            <div>
              <h2 className="text-sm font-semibold text-zinc-200">Recent Products</h2>
              <p className="text-xs text-zinc-500 mt-1">Latest items updated in the catalogue.</p>
            </div>
          </div>

          {recentProducts.length === 0 ? (
            <div className="px-5 py-10 text-center">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-zinc-800/80 border border-zinc-700/50 flex items-center justify-center">
                <Package className="w-6 h-6 text-zinc-600" />
              </div>
              <p className="text-sm font-medium text-zinc-300 mt-4">No products yet</p>
              <p className="text-xs text-zinc-500 mt-1">Start by adding your first product.</p>
            </div>
          ) : (
            <div className="divide-y divide-zinc-800/70">
              {recentProducts.map((product) => {
                const image = product.images[0];
                const imageUrl = image?.url ?? getProductImagePlaceholderUrl();
                const statusTone =
                  STATUS_STYLES[product.status as keyof typeof STATUS_STYLES] ?? STATUS_STYLES.draft;

                return (
                  <Link
                    key={product.id}
                    href={`/dashboard/products/${product.id}`}
                    className="flex items-center gap-4 px-5 py-4 hover:bg-zinc-900/30 transition-colors"
                  >
                    <div className="w-14 h-14 rounded-xl overflow-hidden border border-zinc-800 bg-zinc-900 shrink-0 flex items-center justify-center">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={imageUrl} alt={product.name} className="w-full h-full object-cover" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-medium text-zinc-100 truncate">{product.name}</p>
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full border text-[10px] font-medium ${statusTone}`}
                        >
                          {product.status}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-500 mt-1">
                        {product.category?.name ?? "Uncategorised"} · Updated{" "}
                        {new Date(product.updatedAt).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    </div>

                    <ArrowRight className="w-4 h-4 text-zinc-600 shrink-0" />
                  </Link>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
