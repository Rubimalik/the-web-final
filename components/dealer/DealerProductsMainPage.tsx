"use client";

import { useState } from "react";
import type React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { CATEGORY_IMAGES } from "@/lib/category-images";
import DealerFeaturedProductsSection from "@/components/dealer/DealerFeaturedProductsSection";

function CategoryCard({
  title,
  href,
  imageUrl,
}: {
  title: string;
  href: string;
  imageUrl?: string;
}) {
  return (
    <Link href={href} className="group block text-center">
      <div className="mx-auto overflow-hidden rounded-sm flex items-center justify-center p-6">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageUrl ?? "/logo.png"}
          alt={title}
          className="object-contain transition-transform duration-300 group-hover:scale-[1.03]"
          loading="lazy"
          decoding="async"
          onError={(event) => {
            event.currentTarget.src = "/logo.png";
          }}
        />
      </div>
      <p className="mt-4 text-2xl font-extrabold text-white transition-colors group-hover:text-[var(--brand-cyan)] leading-tight">
        {title}
      </p>
    </Link>
  );
}

export default function DealerProductsMainPage() {
  const router = useRouter();
  const [searchInput, setSearchInput] = useState("");

  function handleSearchSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (searchInput.trim()) {
      router.push(`/dealer/products/printers`);
    }
  }

  return (
    <div className="min-h-screen text-black font-myriad">
      <div className="max-w-6xl mx-auto px-4 py-8 sm:py-10">
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-extrabold uppercase tracking-tight text-black sm:text-4xl">
          Shop
        </h1>
      </div>

      <form onSubmit={handleSearchSubmit} className="mb-8">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-black/50 pointer-events-none" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search..."
            className="w-full border border-black/70 bg-white py-3 pl-9 pr-4 text-sm font-semibold uppercase text-black placeholder:text-black/70 focus:border-[var(--brand-cyan)] focus:outline-none"
          />
        </div>
      </form>

      <div className="mb-12">
        <div className="mx-auto grid max-w-3xl grid-cols-1 gap-x-1.25 gap-y-10 sm:grid-cols-2">
          <CategoryCard
            title="Printers"
            href="/dealer/products/printers"
            imageUrl={CATEGORY_IMAGES.printers}
          />
          <CategoryCard
            title="Parts and Toners"
            href="/dealer/products/consumables"
            imageUrl={CATEGORY_IMAGES.consumables}
          />
        </div>
      </div>

      <DealerFeaturedProductsSection
        title="FEATURED PRODUCTS"
        kicker=""
        description=""
        limit={8}
        className="border-t-0 pt-8"
        centered
        showBrowseLink={false}
        allowGlobalFallback={true}
      />
      </div>
    </div>
  );
}
