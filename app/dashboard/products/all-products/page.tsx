"use client";

import { Suspense, useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Plus, Search, Filter, Trash2, Eye,
  ChevronLeft, ChevronRight, Loader2, AlertCircle,
  Package, Tag, RefreshCw,
} from "lucide-react";
import { getAdminProductCategoryBySlug } from "@/lib/admin-product-categories";
import { getProductImagePlaceholderUrl } from "@/lib/product-image-placeholder";

interface ProductImage {
  id: number;
  url: string;
  key: string;
  isPrimary: boolean;
}

interface Product {
  id: number;
  name: string;
  description: string | null;
  price: number | null;
  status: "draft" | "active" | "archived";
  tags: string | null;
  createdAt: string;
  images: ProductImage[];
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const STATUS_CONFIG = {
  active: { label: "Active", classes: "bg-emerald-500/15 text-emerald-400 border-emerald-500/25", dot: "bg-emerald-400" },
  draft: { label: "Draft", classes: "bg-zinc-500/15 text-zinc-400 border-zinc-500/25", dot: "bg-zinc-400" },
  archived: { label: "Archived", classes: "bg-amber-500/15 text-amber-400 border-amber-500/25", dot: "bg-amber-400" },
};

function buildRoute(pathname: string, params: URLSearchParams) {
  const query = params.toString();
  return query ? `${pathname}?${query}` : pathname;
}

function AllProductsPageContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const searchParamsString = searchParams.toString();
  const [products, setProducts] = useState<Product[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const activeCategory = getAdminProductCategoryBySlug(searchParams.get("category"));
  const querySearch = searchParams.get("search") ?? "";
  const queryStatus = searchParams.get("status") ?? "";
  const queryPage = Math.max(1, Number.parseInt(searchParams.get("page") || "1", 10) || 1);
  const [searchInput, setSearchInput] = useState(querySearch);
  const [debouncedSearch, setDebouncedSearch] = useState(querySearch);
  const [statusFilter, setStatusFilter] = useState(queryStatus);
  const [page, setPage] = useState(queryPage);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Product | null>(null);

  const updateQueryParams = useCallback((updates: {
    search?: string;
    status?: string;
    page?: number;
  }) => {
    const params = new URLSearchParams(searchParamsString);

    if ("search" in updates) {
      const nextSearch = updates.search?.trim() ?? "";
      if (nextSearch) {
        params.set("search", nextSearch);
      } else {
        params.delete("search");
      }
    }

    if ("status" in updates) {
      const nextStatus = updates.status?.trim() ?? "";
      if (nextStatus) {
        params.set("status", nextStatus);
      } else {
        params.delete("status");
      }
    }

    if ("page" in updates) {
      if ((updates.page ?? 1) > 1) {
        params.set("page", String(updates.page));
      } else {
        params.delete("page");
      }
    }

    router.replace(buildRoute(pathname, params), { scroll: false });
  }, [pathname, router, searchParamsString]);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({ page: String(page), limit: "12" });
      if (debouncedSearch) params.set("search", debouncedSearch);
      if (statusFilter) params.set("status", statusFilter);
      if (activeCategory?.slug) params.set("slug", activeCategory.slug);

      const res = await fetch(`/api/product?${params}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load");
      setProducts(data.data);
      setPagination(data.pagination);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load products");
    } finally {
      setLoading(false);
    }
  }, [activeCategory?.slug, debouncedSearch, page, statusFilter]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  useEffect(() => {
    setSearchInput(querySearch);
    setDebouncedSearch(querySearch);
  }, [querySearch]);

  useEffect(() => {
    setStatusFilter(queryStatus);
  }, [queryStatus]);

  useEffect(() => {
    setPage(queryPage);
  }, [queryPage]);

  useEffect(() => {
    const t = setTimeout(() => {
      const nextSearch = searchInput.trim();
      setDebouncedSearch(nextSearch);

      if (nextSearch === querySearch) {
        return;
      }

      setPage(1);
      updateQueryParams({ search: nextSearch, page: 1 });
    }, 400);
    return () => clearTimeout(t);
  }, [querySearch, searchInput, updateQueryParams]);

  const handleDelete = async (product: Product) => {
    setDeletingId(product.id);
    setDeleteConfirm(null);
    try {
      const res = await fetch(`/api/product/${product.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      fetchProducts();
    } catch {
      setError("Failed to delete product. Try again.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleStatusChange = (nextStatus: string) => {
    setStatusFilter(nextStatus);
    setPage(1);
    updateQueryParams({ status: nextStatus, page: 1 });
  };

  const handlePageChange = (nextPage: number) => {
    setPage(nextPage);
    updateQueryParams({ page: nextPage });
  };

  const totalActive = products.filter((p) => p.status === "active").length;
  const totalDraft = products.filter((p) => p.status === "draft").length;
  const totalArchived = products.filter((p) => p.status === "archived").length;
  const addProductHref = activeCategory
    ? `/dashboard/products/new?category=${activeCategory.slug}`
    : "/dashboard/products/new";
  const pageTitle = activeCategory ? activeCategory.label : "All Products";
  const pageDescription = activeCategory
    ? `${pagination ? pagination.total : 0} products in ${activeCategory.label.toLowerCase()}`
    : pagination
      ? `${pagination.total} products in your catalogue`
      : "Manage your product catalogue";

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-10">

      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-white tracking-tight">{pageTitle}</h1>
          <p className="text-zinc-500 text-sm mt-1">
            {pageDescription}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchProducts}
            className="w-9 h-9 flex items-center justify-center rounded-lg border border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-500 transition-all"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <Link
            href={addProductHref}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition-all shadow-lg shadow-indigo-900/30"
          >
            <Plus className="w-4 h-4" />
            Add Product
          </Link>
        </div>
      </div>

      {/* ── Stats strip ── */}
      {pagination && (
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: "Total", value: pagination.total, color: "text-white" },
            { label: "Active", value: totalActive, color: "text-emerald-400" },
            { label: "Draft", value: totalDraft, color: "text-zinc-400" },
            { label: "Archived", value: totalArchived, color: "text-amber-400" },
          ].map((stat) => (
            <div key={stat.label} className="bg-[#13131a] border border-zinc-800/70 rounded-xl px-4 py-3">
              <p className="text-xs text-zinc-500 mb-1">{stat.label}</p>
              <p className={`text-xl font-semibold ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* ── Filters ── */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by name or tags..."
            className="w-full pl-9 pr-4 py-2.5 text-sm bg-zinc-900/60 border border-zinc-700/60 text-zinc-200 placeholder:text-zinc-600 rounded-lg focus:outline-none focus:border-indigo-500/60 transition-all"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
          <select
            value={statusFilter}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="pl-9 pr-8 py-2.5 text-sm appearance-none bg-zinc-900/60 border border-zinc-700/60 text-zinc-200 rounded-lg focus:outline-none focus:border-indigo-500/60 transition-all cursor-pointer"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </div>

      {/* ── Error ── */}
      {error && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />{error}
        </div>
      )}

      {/* ── Loading skeleton ── */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-[#13131a] border border-zinc-800/70 rounded-2xl overflow-hidden animate-pulse">
              <div className="aspect-[4/3] bg-zinc-800" />
              <div className="p-4 space-y-2">
                <div className="h-4 bg-zinc-800 rounded w-3/4" />
                <div className="h-3 bg-zinc-800 rounded w-1/2" />
                <div className="h-3 bg-zinc-800 rounded w-1/3 mt-3" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Empty state ── */}
      {!loading && !error && products.length === 0 && (
        <div className="flex flex-col items-center gap-4 py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-zinc-800/80 border border-zinc-700/50 flex items-center justify-center">
            <Package className="w-7 h-7 text-zinc-600" />
          </div>
          <div>
            <p className="text-base font-medium text-zinc-300">No products found</p>
            <p className="text-sm text-zinc-600 mt-1">
              {searchInput || statusFilter ? "Try adjusting your filters" : "Start by adding your first product"}
            </p>
          </div>
          {!searchInput && !statusFilter && (
            <Link
              href={addProductHref}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition-all"
            >
              <Plus className="w-4 h-4" />Add your first product
            </Link>
          )}
        </div>
      )}

      {/* ── Product Grid ── */}
      {!loading && !error && products.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {products.map((product) => {
            const primaryImg = product.images?.find((i) => i.isPrimary) || product.images?.[0];
            const imageUrl = primaryImg?.url ?? getProductImagePlaceholderUrl();
            const status = STATUS_CONFIG[product.status];
            const tags = product.tags?.split(",").map((t) => t.trim()).filter(Boolean) ?? [];

            return (
              <div
                key={product.id}
                className="group bg-[#13131a] border border-zinc-800/70 rounded-2xl overflow-hidden hover:border-zinc-700 transition-all duration-200 flex flex-col"
              >
                {/* Image */}
                <div className="relative aspect-[4/3] bg-zinc-900 overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />

                  {/* Status badge */}
                  <div className="absolute top-2.5 left-2.5">
                    <span className={`flex items-center gap-1.5 text-[10px] font-semibold px-2 py-1 rounded-full border backdrop-blur-sm ${status.classes}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                      {status.label}
                    </span>
                  </div>

                  {/* Image count */}
                  {product.images.length > 1 && (
                    <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-sm text-white text-[10px] font-medium px-1.5 py-0.5 rounded-md">
                      +{product.images.length - 1}
                    </div>
                  )}

                  {/* Hover actions overlay */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Link
                      href={`/dashboard/products/${product.id}`}
                      className="w-9 h-9 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-all"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => setDeleteConfirm(product)}
                      disabled={deletingId === product.id}
                      className="w-9 h-9 rounded-xl bg-red-500/20 backdrop-blur-sm border border-red-500/30 flex items-center justify-center text-red-400 hover:bg-red-500/30 transition-all disabled:opacity-50"
                    >
                      {deletingId === product.id
                        ? <Loader2 className="w-4 h-4 animate-spin" />
                        : <Trash2 className="w-4 h-4" />
                      }
                    </button>
                  </div>
                </div>

                {/* Info */}
                <div className="p-4 flex flex-col gap-2 flex-1">
                  <div>
                    <h3 className="text-sm font-semibold text-zinc-100 truncate">{product.name}</h3>
                    {product.description && (
                      <p className="text-xs text-zinc-500 mt-0.5 line-clamp-2">{product.description}</p>
                    )}
                  </div>

                  {/* Tags */}
                  {tags.length > 0 && (
                    <div className="flex items-center gap-1 flex-wrap">
                      <Tag className="w-3 h-3 text-zinc-600 shrink-0" />
                      {tags.slice(0, 3).map((tag) => (
                        <span key={tag} className="text-[10px] text-zinc-500 bg-zinc-800 px-1.5 py-0.5 rounded-md">
                          {tag}
                        </span>
                      ))}
                      {tags.length > 3 && (
                        <span className="text-[10px] text-zinc-600">+{tags.length - 3}</span>
                      )}
                    </div>
                  )}
                  {/* Price + date */}
                  <div className="flex items-center justify-between mt-auto pt-2 border-t border-zinc-800/60">
                    <span className="text-sm font-bold text-white">
                      {product.price != null
                        ? `£${Number(product.price).toFixed(2)}`
                        : <span className="text-xs font-normal text-zinc-500 italic">POA</span>
                      }
                    </span>
                    <span className="text-[10px] text-zinc-600">
                      {new Date(product.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Pagination ── */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-sm text-zinc-500">
            Showing {((page - 1) * 12) + 1}–{Math.min(page * 12, pagination.total)} of {pagination.total}
          </p>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 1}
              className="w-8 h-8 rounded-lg border border-zinc-700 flex items-center justify-center text-zinc-400 hover:text-white hover:border-zinc-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
              const p = Math.max(1, Math.min(page - 2, pagination.totalPages - 4)) + i;
              return (
                <button
                  key={p}
                  onClick={() => handlePageChange(p)}
                  className={`w-8 h-8 rounded-lg text-sm font-medium transition-all ${p === page
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-900/30"
                    : "border border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-500"
                    }`}
                >
                  {p}
                </button>
              );
            })}
            <button
              onClick={() => handlePageChange(page + 1)}
              disabled={page === pagination.totalPages}
              className="w-8 h-8 rounded-lg border border-zinc-700 flex items-center justify-center text-zinc-400 hover:text-white hover:border-zinc-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ── Delete confirmation modal ── */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#13131a] border border-zinc-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <div className="w-11 h-11 rounded-xl bg-red-500/15 border border-red-500/20 flex items-center justify-center mb-4">
              <Trash2 className="w-5 h-5 text-red-400" />
            </div>
            <h3 className="text-base font-semibold text-white mb-1">Delete product?</h3>
            <p className="text-sm text-zinc-400 mb-5">
              <span className="text-white font-medium">&quot;{deleteConfirm.name}&quot;</span> will be permanently deleted along with all its images. This cannot be undone.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-2 text-sm font-medium border border-zinc-700 text-zinc-400 hover:text-white rounded-xl transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 py-2 text-sm font-semibold bg-red-600 hover:bg-red-500 text-white rounded-xl transition-all"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AllProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto space-y-6 pb-10">
          <div className="h-24 rounded-2xl border border-zinc-800/70 bg-[#13131a] animate-pulse" />
          <div className="h-14 rounded-2xl border border-zinc-800/70 bg-[#13131a] animate-pulse" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="aspect-[4/5] rounded-2xl border border-zinc-800/70 bg-[#13131a] animate-pulse"
              />
            ))}
          </div>
        </div>
      }
    >
      <AllProductsPageContent />
    </Suspense>
  );
}
