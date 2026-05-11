"use client";

import { useState, useEffect, type BaseSyntheticEvent } from "react";
import { useForm, Controller } from "react-hook-form";
import { useRouter } from "next/navigation";
import { ImageUpload, type UploadedImage } from "./ImageUpload";
import { type AdminProductCategorySlug } from "@/lib/admin-product-categories";
import { safeReadJsonResponse } from "@/lib/safe-json";
import {
  PARTS_AND_TONER_BRANDS,
  PARTS_AND_TONER_TYPES,
  PRODUCT_MAIN_CATEGORIES,
  getPartsLeafCategory,
  getProductCategoryPath,
} from "@/lib/product-taxonomy";
import {
  Package, DollarSign, Layers, Info, AlertCircle,
  ChevronDown, CheckCircle2, Tag, Link2,
} from "lucide-react";

type ProductFormData = {
  name: string;
  description: string;
  url: string;
  price: string;
  dealerPrice: string;
  dealerNotes: string;
  visibility: "public" | "dealer" | "both";
  status: "draft" | "active" | "archived";
  isFeatured: boolean;
  tags: string;
  categoryId: string;
  mainCategory: string;
  brand: string;
  productType: string;
  images: UploadedImage[];
};

interface Category {
  id: number;
  name: string;
  slug: string;
}

const statuses = [
  { value: "draft", label: "Draft", desc: "Not visible to customers", dot: "bg-zinc-500" },
  { value: "active", label: "Active", desc: "Listed and available", dot: "bg-emerald-500" },
  { value: "archived", label: "Archived", desc: "Hidden from store", dot: "bg-amber-500" },
] as const;

const visibilityOptions = [
  { value: "public", label: "Public only" },
  { value: "dealer", label: "Dealer only" },
  { value: "both", label: "Public + dealer" },
] as const;

function Field({ label, required, error, hint, children }: {
  label: string; required?: boolean; error?: string; hint?: string; children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="flex items-center gap-1.5 text-sm font-medium text-zinc-300">
        {label}
        {required && <span className="text-indigo-400">*</span>}
        {hint && <span title={hint}><Info className="w-3.5 h-3.5 text-zinc-600 cursor-help" /></span>}
      </label>
      {children}
      {error && (
        <p className="flex items-center gap-1.5 text-xs text-red-400">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />{error}
        </p>
      )}
    </div>
  );
}

function Input({ icon: Icon, prefix, error, className = "", ...props }:
  React.InputHTMLAttributes<HTMLInputElement> & { icon?: React.ElementType; prefix?: string; error?: boolean }) {
  return (
    <div className="relative">
      {Icon && <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />}
      {prefix && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-500 pointer-events-none">{prefix}</span>}
      <input className={`w-full bg-zinc-900/60 border text-sm text-zinc-200 placeholder:text-zinc-600 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-1 transition-all
        ${error ? "border-red-500/50 focus:border-red-500 focus:ring-red-500/20" : "border-zinc-700/60 focus:border-indigo-500/60 focus:ring-indigo-500/20 hover:border-zinc-600"}
        ${Icon ? "pl-9" : ""} ${prefix ? "pl-7" : ""} ${className}`} {...props} />
    </div>
  );
}

function Textarea({ error, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { error?: boolean }) {
  return (
    <textarea className={`w-full bg-zinc-900/60 border text-sm text-zinc-200 placeholder:text-zinc-600 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-1 transition-all resize-none
      ${error ? "border-red-500/50 focus:border-red-500 focus:ring-red-500/20" : "border-zinc-700/60 focus:border-indigo-500/60 focus:ring-indigo-500/20 hover:border-zinc-600"}`} {...props} />
  );
}

function Select({ error, children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement> & { error?: boolean }) {
  return (
    <div className="relative">
      <select className={`w-full appearance-none bg-zinc-900/60 border text-sm text-zinc-200 rounded-lg px-3 py-2.5 pr-9 focus:outline-none focus:ring-1 transition-all cursor-pointer
        ${error ? "border-red-500/50 focus:border-red-500 focus:ring-red-500/20" : "border-zinc-700/60 focus:border-indigo-500/60 focus:ring-indigo-500/20 hover:border-zinc-600"}`} {...props}>
        {children}
      </select>
      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
    </div>
  );
}

function Card({ title, icon: Icon, children, className = "" }: {
  title: string; icon?: React.ElementType; children: React.ReactNode; className?: string;
}) {
  return (
    <div className={`bg-[#13131a] border border-zinc-800/70 rounded-2xl overflow-hidden ${className}`}>
      <div className="flex items-center gap-2.5 px-5 py-4 border-b border-zinc-800/70">
        {Icon && <div className="w-7 h-7 rounded-lg bg-zinc-800 flex items-center justify-center"><Icon className="w-3.5 h-3.5 text-zinc-400" /></div>}
        <h2 className="text-sm font-semibold text-zinc-200">{title}</h2>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

export function ProductUploadForm({
  initialCategorySlug,
}: {
  initialCategorySlug?: AdminProductCategorySlug;
}) {
  const router = useRouter();
  const [submitState, setSubmitState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [submitError, setSubmitError] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<ProductFormData>({
    defaultValues: {
      status: "draft",
      isFeatured: false,
      visibility: "public",
      images: [],
      categoryId: "",
      mainCategory: "",
      brand: "",
      productType: "",
      dealerPrice: "",
      dealerNotes: "",
    },
  });

  useEffect(() => {
    void (async () => {
      try {
        const response = await fetch("/api/category");
        const data = await safeReadJsonResponse<{ data?: Category[]; error?: string }>(
          response,
          "ProductUploadForm categories"
        );
        if (!response.ok) {
          throw new Error(data?.error || "Failed to load categories");
        }
        setCategories(data?.data || []);
      } catch (error) {
        console.error("[ProductUploadForm categories]", error);
        setCategories([]);
      }
    })();
  }, []);

  useEffect(() => {
    if (!initialCategorySlug || categories.length === 0 || getValues("categoryId")) {
      return;
    }

    const matchedCategory = categories.find((category) => category.slug === initialCategorySlug);
    if (!matchedCategory) {
      return;
    }

    const categoryPath = getProductCategoryPath(matchedCategory.slug);
    setValue("mainCategory", categoryPath.mainSlug || matchedCategory.slug, { shouldDirty: false, shouldValidate: true });
    setValue("brand", categoryPath.brandSlug, { shouldDirty: false, shouldValidate: true });
    setValue("productType", categoryPath.typeSlug, { shouldDirty: false, shouldValidate: true });
    setValue("categoryId", String(matchedCategory.id), { shouldDirty: false, shouldValidate: true });
  }, [categories, getValues, initialCategorySlug, setValue]);

  const descriptionValue = watch("description") || "";
  const watchedImages = watch("images") || [];
  const mainCategory = watch("mainCategory");
  const selectedBrand = watch("brand");
  const selectedType = watch("productType");

  useEffect(() => {
    if (categories.length === 0 || !mainCategory) return;

    const leafCategory =
      mainCategory === "consumables" ? getPartsLeafCategory(selectedBrand, selectedType) : null;
    const slug = mainCategory === "consumables" ? leafCategory?.slug || "" : mainCategory;
    const matchedCategory = slug
      ? categories.find((category) => category.slug === slug)
      : null;

    setValue("categoryId", matchedCategory ? String(matchedCategory.id) : "", {
      shouldDirty: true,
      shouldValidate: true,
    });
  }, [categories, mainCategory, selectedBrand, selectedType, setValue]);

  const onSubmit = async (
    data: ProductFormData,
    event?: BaseSyntheticEvent,
  ) => {
    if (data.images.length === 0) {
      setSubmitError("Please upload at least one product image.");
      return;
    }

    if (data.mainCategory === "consumables" && (!data.brand || !data.productType)) {
      setSubmitError("Please select a brand and subcategory for consumables.");
      return;
    }

    const submitter = (event?.nativeEvent as SubmitEvent | undefined)?.submitter as
      | HTMLButtonElement
      | undefined;
    const submitIntent = submitter?.dataset.submitIntent === "draft" ? "draft" : data.status;

    setSubmitState("loading");
    setSubmitError("");
    try {
      const payload = {
        name: data.name,
        description: data.description || undefined,
        url: data.url || undefined,
        price: data.price ? parseFloat(data.price) : null,
        dealerPrice: data.dealerPrice ? parseFloat(data.dealerPrice) : null,
        dealerNotes: data.dealerNotes?.trim() || null,
        visibility: data.visibility || "public",
        status: submitIntent,
        isFeatured: data.isFeatured,
        tags: data.tags || undefined,
        categoryId: data.categoryId ? parseInt(data.categoryId) : null,
        images: data.images.map((img) => ({ url: img.url, key: img.key, isPrimary: img.isPrimary })),
      };

      const res = await fetch("/api/product", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await safeReadJsonResponse<{ error?: string }>(
          res,
          "ProductUploadForm create product"
        );
        throw new Error(err?.error || "Failed to create product");
      }

      setSubmitState("success");
      const redirectUrl = data.mainCategory
        ? `/admin/products/all-products?category=${data.mainCategory}${data.brand ? `&brand=${data.brand}` : ""}${data.productType ? `&type=${data.productType}` : ""}`
        : "/admin/products/all-products";
      setTimeout(() => router.push(redirectUrl), 1500);
    } catch (err) {
      setSubmitState("error");
      setSubmitError(err instanceof Error ? err.message : "Something went wrong");
    }
  };

  const isSuccess = submitState === "success";

  const checklist = [
    { label: "Add product name", done: !!watch("name") },
    { label: "Write a description", done: descriptionValue.length >= 20 },
    { label: "Upload at least one image", done: watchedImages.length > 0 },
    { label: "Choose a category", done: !!watch("categoryId") },
  ];

  return (
    <form id="product-form" onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">

        {/* Left column */}
        <div className="xl:col-span-2 space-y-5">
          <Card title="Product Information" icon={Package}>
            <div className="space-y-4">
              <Field label="Product Name" required error={errors.name?.message}>
                <Input placeholder="e.g. Canon iR2630i Photocopier" error={!!errors.name}
                  {...register("name", { required: "Product name is required", minLength: { value: 3, message: "Min 3 characters" } })} />
              </Field>
              <Field label="Description" hint="Full product description visible to customers" error={errors.description?.message}>
                <div className="relative">
                  <Textarea rows={6} placeholder="Describe features, specs, condition, included accessories..."
                    error={!!errors.description} {...register("description")} />
                  <span className="absolute bottom-2.5 right-3 text-[10px] text-zinc-600">{descriptionValue.length} chars</span>
                </div>
              </Field>
              <Field label="Dealer Notes" hint="Private notes visible only in the dealer area" error={errors.dealerNotes?.message}>
                <Textarea rows={4} placeholder="Dealer-only notes, stock details, or trade terms..."
                  error={!!errors.dealerNotes} {...register("dealerNotes")} />
              </Field>
              <Field label="Product URL" hint="External link for more info about this product" error={errors.url?.message}>
                <Input icon={Link2} placeholder="https://example.com/product-page" error={!!errors.url}
                  {...register("url", { validate: (v) => !v || /^https?:\/\/.+/.test(v) || "Enter a valid URL starting with http:// or https://" })} />
              </Field>
              <Field label="Tags" hint="Comma-separated keywords">
                <Input placeholder="laser, colour, a3, refurbished..." {...register("tags")} />
              </Field>
            </div>
          </Card>

          <Card title="Product Images" icon={Package}>
            <Controller name="images" control={control}
              render={({ field }) => <ImageUpload value={field.value} onChange={field.onChange} />} />
            {submitError.includes("image") && (
              <p className="mt-2 flex items-center gap-1.5 text-xs text-red-400">
                <AlertCircle className="w-3.5 h-3.5" />{submitError}
              </p>
            )}
          </Card>
        </div>

        {/* Right column */}
        <div className="space-y-5">
          {/* Pricing */}
          <Card title="Pricing" icon={DollarSign}>
            <div className="max-w-xs">
              <Field label="Price" error={errors.price?.message}>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  prefix="£"
                  placeholder="0.00"
                  error={!!errors.price}
                  {...register("price", {
                    min: { value: 0, message: "Price must be positive" },
                  })}
                />
              </Field>
              <p className="text-xs text-zinc-600 mt-2">Leave empty to show &quot;Price on application&quot;</p>
              <div className="mt-4">
                <Field label="Dealer Price" error={errors.dealerPrice?.message}>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    prefix="Â£"
                    placeholder="0.00"
                    error={!!errors.dealerPrice}
                    {...register("dealerPrice", {
                      min: { value: 0, message: "Dealer price must be positive" },
                    })}
                  />
                </Field>
                <p className="text-xs text-zinc-600 mt-2">Leave empty if dealer price matches normal pricing.</p>
              </div>
            </div>
          </Card>
          {/* Category */}
          <Card title="Category" icon={Tag}>
            <div className="space-y-4">
              <Field label="Main Category" required error={errors.mainCategory?.message}>
                <Select {...register("mainCategory", { required: "Please select a main category" })} error={!!errors.mainCategory}>
                  <option value="">Select category...</option>
                  {PRODUCT_MAIN_CATEGORIES.map((category) => (
                    <option key={category.slug} value={category.slug}>
                      {category.slug === "photocopiers" ? "Printers" : category.label}
                    </option>
                  ))}
                </Select>
              </Field>

              {mainCategory === "consumables" ? (
                <div className="grid grid-cols-1 gap-4">
                  <Field label="Brand" required error={errors.brand?.message}>
                    <Select {...register("brand", { required: mainCategory === "consumables" ? "Please select a brand" : false })} error={!!errors.brand}>
                      <option value="">Select brand...</option>
                      {PARTS_AND_TONER_BRANDS.map((brand) => (
                        <option key={brand.slug} value={brand.slug}>{brand.label}</option>
                      ))}
                    </Select>
                  </Field>
                  <Field label="Subcategory" required error={errors.productType?.message}>
                    <Select {...register("productType", { required: mainCategory === "consumables" ? "Please select a subcategory" : false })} error={!!errors.productType}>
                      <option value="">Select subcategory...</option>
                      {PARTS_AND_TONER_TYPES.map((type) => (
                        <option key={type.slug} value={type.slug}>{type.label}</option>
                      ))}
                    </Select>
                  </Field>
                </div>
              ) : null}

              <input
                type="hidden"
                {...register("categoryId", { required: "Please select a complete category" })}
              />
              {mainCategory === "consumables" && selectedBrand && selectedType ? (
                <p className="rounded-lg border border-indigo-500/20 bg-indigo-500/10 px-3 py-2 text-xs text-indigo-200">
                  Product will be listed under {PARTS_AND_TONER_BRANDS.find((brand) => brand.slug === selectedBrand)?.label} {PARTS_AND_TONER_TYPES.find((type) => type.slug === selectedType)?.label}.
                </p>
              ) : null}
            </div>
            {categories.length === 0 && (
              <p className="mt-2 text-xs text-zinc-600">No categories found. Run the seed script first.</p>
            )}
          </Card>

          {/* Status */}
          <Card title="Publishing" icon={Layers}>
            <div className="space-y-4">
              <Field label="Status">
                <Select {...register("status")}>
                  {statuses.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                </Select>
              </Field>
              <Field label="Visibility">
                <Select {...register("visibility")}>
                  {visibilityOptions.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </Select>
              </Field>
              <label className="flex items-start gap-3 rounded-lg border border-zinc-800/60 p-3 transition-colors hover:border-zinc-700">
                <input
                  type="checkbox"
                  {...register("isFeatured")}
                  className="mt-0.5 h-4 w-4 rounded border-zinc-700 bg-zinc-900 accent-indigo-500"
                />
                <span>
                  <span className="block text-sm font-medium text-zinc-300">Show in Featured Products</span>
                  <span className="mt-0.5 block text-xs text-zinc-600">
                    Display this product in featured sections when it is active and public.
                  </span>
                </span>
              </label>
              <div className="space-y-2">
                {statuses.map((s) => (
                  <label key={s.value} className="flex items-start gap-3 p-3 rounded-lg border border-zinc-800/60 hover:border-zinc-700 cursor-pointer transition-colors">
                    <input type="radio" value={s.value} {...register("status")} className="mt-0.5 accent-indigo-500" />
                    <div>
                      <div className="flex items-center gap-2">
                        <div className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                        <p className="text-sm font-medium text-zinc-300">{s.label}</p>
                      </div>
                      <p className="text-xs text-zinc-600 mt-0.5">{s.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </Card>

          {/* Checklist */}
          <div className="bg-gradient-to-br from-indigo-600/10 to-violet-600/10 border border-indigo-500/20 rounded-2xl p-5">
            <h3 className="text-sm font-semibold text-indigo-300 mb-3">Checklist</h3>
            <ul className="space-y-2 text-xs">
              {checklist.map((item) => (
                <li key={item.label} className="flex items-center gap-2">
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 transition-colors ${item.done ? "border-emerald-500 bg-emerald-500/20" : "border-zinc-700"}`}>
                    {item.done
                      ? <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" />
                      : <div className="w-1.5 h-1.5 rounded-full bg-zinc-700" />}
                  </div>
                  <span className={item.done ? "text-zinc-300" : "text-zinc-500"}>{item.label}</span>
                </li>
              ))}
            </ul>
          </div>

          {submitState === "error" && !submitError.includes("image") && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />{submitError}
            </div>
          )}
          {isSuccess && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs">
              <CheckCircle2 className="w-4 h-4 shrink-0" />Product created! Redirecting...
            </div>
          )}
        </div>
      </div>
    </form>
  );
}
