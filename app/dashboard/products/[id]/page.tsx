"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    ChevronLeft, Loader2, Save, CheckCircle2, AlertCircle,
    ImageOff, Tag, Package, Layers, DollarSign,
    Trash2, ExternalLink, ChevronLeft as Prev, ChevronRight as Next, Link2, GripVertical,
} from "lucide-react";
import { HeicImage } from "@/components/HeicImage";
import { ImageUpload, type UploadedImage } from "@/components/dashboard/ImageUpload";
import Link from "next/link";

interface ProductImage { id: number; url: string; isPrimary: boolean; }
interface Category { id: number; name: string; slug: string; }
interface Product {
    id: number; name: string; description: string | null;
    url: string | null; price: number | null; status: string; tags: string | null;
    categoryId: number | null; createdAt: string; updatedAt: string;
    images: ProductImage[]; category: Category | null;
}

const STATUS_CONFIG = {
    active: { label: "Active", dot: "bg-emerald-400", ring: "ring-emerald-500/30", text: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
    draft: { label: "Draft", dot: "bg-zinc-400", ring: "ring-zinc-500/30", text: "text-zinc-400", bg: "bg-zinc-500/10 border-zinc-500/20" },
    archived: { label: "Archived", dot: "bg-amber-400", ring: "ring-amber-500/30", text: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20" },
} as const;

export default function ProductEditPage() {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();

    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [saveState, setSaveState] = useState<"idle" | "success" | "error">("idle");
    const [error, setError] = useState("");
    const [categories, setCategories] = useState<Category[]>([]);
    const [activeImg, setActiveImg] = useState(0);
    const [newImages, setNewImages] = useState<UploadedImage[]>([]);
    const [editedImages, setEditedImages] = useState<ProductImage[]>([]);
    const [draggedImgId, setDraggedImgId] = useState<number | null>(null);
    const [dragOverImgId, setDragOverImgId] = useState<number | null>(null);
    const categoryListHref = product?.category?.slug
        ? `/dashboard/products/all-products?category=${product.category.slug}`
        : "/dashboard/products/all-products";

    // Editable fields
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState("");
    const [status, setStatus] = useState("draft");
    const [tags, setTags] = useState("");
    const [url, setUrl] = useState("");
    const [categoryId, setCategoryId] = useState("");

    useEffect(() => {
        Promise.all([
            fetch(`/api/product/${id}`).then((r) => r.json()),
            fetch("/api/category").then((r) => r.json()),
        ]).then(([pData, cData]) => {
            if (pData.error) throw new Error(pData.error);
            const p: Product = pData.data;
            setProduct(p);
            setEditedImages(p.images);
            setName(p.name);
            setDescription(p.description || "");
            setPrice(p.price != null ? String(p.price) : "");
            setStatus(p.status);
            setTags(p.tags || "");
            setUrl(p.url || "");
            setCategoryId(p.categoryId ? String(p.categoryId) : "");
            setCategories(cData.data || []);
        }).catch((e) => setError(e.message))
            .finally(() => setLoading(false));
    }, [id]);

    useEffect(() => {
        if (editedImages.length === 0 && activeImg !== 0) {
            setActiveImg(0);
            return;
        }
        if (editedImages.length > 0 && activeImg > editedImages.length - 1) {
            setActiveImg(editedImages.length - 1);
        }
    }, [activeImg, editedImages.length]);

    const handleDeleteExistingImage = (imageId: number) => {
        setEditedImages((prev) => {
            const nextImages = prev.filter((img) => img.id !== imageId);
            setActiveImg((current) => {
                if (nextImages.length === 0) return 0;
                return Math.min(current, nextImages.length - 1);
            });
            return nextImages;
        });
    };

    const handleReorderDragStart = (e: React.DragEvent, id: number) => {
        e.stopPropagation();
        setDraggedImgId(id);
        e.dataTransfer.effectAllowed = "move";
    };

    const handleReorderDragOver = (e: React.DragEvent, id: number) => {
        e.preventDefault();
        e.stopPropagation();
        e.dataTransfer.dropEffect = "move";
        if (id !== draggedImgId) setDragOverImgId(id);
    };

    const handleReorderDrop = (e: React.DragEvent, targetId: number) => {
        e.preventDefault();
        e.stopPropagation();
        if (!draggedImgId || draggedImgId === targetId) {
            setDraggedImgId(null);
            setDragOverImgId(null);
            return;
        }
        setEditedImages((prev) => {
            const from = prev.findIndex((img) => img.id === draggedImgId);
            const to = prev.findIndex((img) => img.id === targetId);
            if (from === -1 || to === -1) return prev;
            const updated = [...prev];
            const [item] = updated.splice(from, 1);
            updated.splice(to, 0, item);
            return updated;
        });
        setDraggedImgId(null);
        setDragOverImgId(null);
    };

    const handleReorderDragEnd = () => {
        setDraggedImgId(null);
        setDragOverImgId(null);
    };

    const handleSave = async () => {
        setSaving(true);
        setSaveState("idle");
        try {
            const hasPrimaryInNewImages = newImages.some((img) => img.isPrimary);
            const res = await fetch(`/api/product/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name,
                    description: description || null,
                    url: url || null,
                    price: price ? parseFloat(price) : null,
                    status,
                    tags: tags || null,
                    categoryId: categoryId ? parseInt(categoryId) : null,
                    editedImages: editedImages.map((img) => ({
                        id: img.id,
                        isPrimary: !hasPrimaryInNewImages && editedImages[0]?.id === img.id,
                    })),
                    newImages: newImages.length > 0
                        ? newImages.map((img) => ({
                            url: img.url,
                            key: img.key,
                            isPrimary: img.isPrimary,
                        }))
                        : undefined,
                }),
            });
            if (!res.ok) throw new Error("Failed to save");
            const data = await res.json();
            setProduct(data.data);
            setEditedImages(data.data.images);
            setNewImages([]);
            setSaveState("success");
            setTimeout(() => setSaveState("idle"), 3000);
        } catch {
            setSaveState("error");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm(`Delete "${product?.name}"? This cannot be undone.`)) return;
        setDeleting(true);
        try {
            const res = await fetch(`/api/product/${id}`, { method: "DELETE" });
            if (!res.ok) {
                throw new Error("Failed to delete");
            }
            router.push(categoryListHref);
        } catch {
            alert("Failed to delete");
            setDeleting(false);
        }
    };

    const imagesChanged = editedImages.length !== product?.images.length ||
        editedImages.some((img, i) => img.id !== product?.images[i]?.id);

    const isDirty = product && (
        name !== product.name ||
        description !== (product.description || "") ||
        url !== (product.url || "") ||
        price !== (product.price != null ? String(product.price) : "") ||
        status !== product.status ||
        tags !== (product.tags || "") ||
        categoryId !== (product.categoryId ? String(product.categoryId) : "") ||
        newImages.length > 0 ||
        imagesChanged
    );

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <Loader2 className="w-6 h-6 text-zinc-500 animate-spin" />
        </div>
    );

    if (error || !product) return (
        <div className="flex flex-col items-center gap-3 py-20">
            <AlertCircle className="w-8 h-8 text-red-400" />
            <p className="text-zinc-400 text-sm">{error || "Product not found"}</p>
            <Link href="/dashboard/products/all-products" className="text-indigo-400 text-sm hover:underline">← Go back</Link>
        </div>
    );

    const images = editedImages;
    const cfg = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.draft;

    return (
        <div className="max-w-6xl mx-auto space-y-6 pb-10">

            {/* ── Header ── */}
            <div className="flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-3">
                    <Link href={categoryListHref}
                        className="w-8 h-8 rounded-lg border border-zinc-700 flex items-center justify-center text-zinc-400 hover:text-white hover:border-zinc-500 transition-all">
                        <ChevronLeft className="w-4 h-4" />
                    </Link>
                    <div>
                        <h1 className="text-xl font-semibold text-white tracking-tight truncate max-w-md">{product.name}</h1>
                        <p className="text-xs text-zinc-500 mt-0.5">
                            ID #{product.id} · Updated {new Date(product.updatedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <a href={`/products/${product.id}`} target="_blank"
                        className="flex items-center gap-1.5 px-3 py-2 text-xs text-zinc-400 border border-zinc-700 hover:border-zinc-500 hover:text-white rounded-lg transition-all">
                        <ExternalLink className="w-3.5 h-3.5" />View live
                    </a>
                    <button onClick={handleDelete} disabled={deleting}
                        className="flex items-center gap-1.5 px-3 py-2 text-xs text-red-400 border border-red-500/20 hover:bg-red-500/10 rounded-lg transition-all disabled:opacity-50">
                        {deleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                        Delete
                    </button>
                    <button onClick={handleSave} disabled={saving || !isDirty}
                        className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-all shadow-lg shadow-indigo-900/30">
                        {saving
                            ? <><Loader2 className="w-4 h-4 animate-spin" />Saving...</>
                            : saveState === "success"
                                ? <><CheckCircle2 className="w-4 h-4" />Saved!</>
                                : <><Save className="w-4 h-4" />Save changes</>
                        }
                    </button>
                </div>
            </div>

            {/* Save feedback */}
            {saveState === "error" && (
                <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                    <AlertCircle className="w-4 h-4 shrink-0" />Failed to save. Please try again.
                </div>
            )}
            {saveState === "success" && (
                <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />Changes saved successfully.
                </div>
            )}

            {/* ── Main grid ── */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

                {/* ── Left: images + read-only meta ── */}
                <div className="space-y-5">

                    {/* Image viewer */}
                    <div className="bg-[#13131a] border border-zinc-800/70 rounded-2xl overflow-hidden">
                        <div className="flex items-center gap-2.5 px-5 py-4 border-b border-zinc-800/70">
                            <div className="w-7 h-7 rounded-lg bg-zinc-800 flex items-center justify-center">
                                <Package className="w-3.5 h-3.5 text-zinc-400" />
                            </div>
                            <h2 className="text-sm font-semibold text-zinc-200">Images</h2>
                            <span className="ml-auto text-xs text-zinc-600">{images.length} photo{images.length !== 1 ? "s" : ""}</span>
                        </div>

                        <div className="p-4 space-y-3">
                            {/* Main image */}
                            <div className="relative aspect-4/3 rounded-xl overflow-hidden bg-zinc-900">
                                {images[activeImg] ? (
                                    <HeicImage src={images[activeImg].url} alt={product.name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center gap-2">
                                        <ImageOff className="w-8 h-8 text-zinc-700" />
                                        <span className="text-xs text-zinc-600">No images uploaded</span>
                                    </div>
                                )}
                                {images.length > 1 && (
                                    <>
                                        <button onClick={() => setActiveImg((i) => (i - 1 + images.length) % images.length)}
                                            className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/60 flex items-center justify-center hover:bg-black/80 transition-all">
                                            <Prev className="w-3.5 h-3.5 text-white" />
                                        </button>
                                        <button onClick={() => setActiveImg((i) => (i + 1) % images.length)}
                                            className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/60 flex items-center justify-center hover:bg-black/80 transition-all">
                                            <Next className="w-3.5 h-3.5 text-white" />
                                        </button>
                                        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/60 text-white/60 text-[10px] px-2 py-0.5 rounded-full">
                                            {activeImg + 1} / {images.length}
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* Thumbnails - Draggable */}
                            {images.length > 1 && (
                                <>
                                    <p className="text-xs text-zinc-500">Drag to reorder images</p>
                                    <div className="flex gap-2 overflow-x-auto pb-1">
                                        {images.map((img, i) => (
                                            <div
                                                key={img.id}
                                                draggable
                                                onDragStart={(e) => handleReorderDragStart(e, img.id)}
                                                onDragOver={(e) => handleReorderDragOver(e, img.id)}
                                                onDrop={(e) => handleReorderDrop(e, img.id)}
                                                onDragEnd={handleReorderDragEnd}
                                                onDragLeave={() => setDragOverImgId(null)}
                                                className={`relative group shrink-0 w-14 h-14 rounded-lg overflow-hidden border-2 cursor-grab active:cursor-grabbing transition-all ${draggedImgId === img.id
                                                    ? "opacity-40 scale-95"
                                                    : dragOverImgId === img.id
                                                        ? "border-indigo-400 ring-2 ring-indigo-400/40 scale-105"
                                                        : i === activeImg
                                                            ? "border-indigo-500"
                                                            : "border-zinc-700 hover:border-zinc-500"
                                                    }`}
                                            >
                                                <button onClick={() => setActiveImg(i)} className="w-full h-full">
                                                    <HeicImage src={img.url} alt="" className="w-full h-full object-cover" />
                                                </button>
                                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                    <button
                                                        type="button"
                                                        onClick={(e) => { e.stopPropagation(); handleDeleteExistingImage(img.id); }}
                                                        className="w-6 h-6 rounded bg-red-500/20 text-red-400 border border-red-500/30 flex items-center justify-center hover:bg-red-500/30 transition-colors"
                                                    >
                                                        <Trash2 className="w-3 h-3" />
                                                    </button>
                                                </div>
                                                <div className="absolute top-0.5 left-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <div className="w-4 h-4 rounded bg-black/50 flex items-center justify-center">
                                                        <GripVertical className="w-2.5 h-2.5 text-white/70" />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}

                            {/* Add more images */}
                            <div className="pt-3 border-t border-zinc-800/50">
                                <h3 className="text-xs font-semibold text-zinc-400 mb-3">Add more images</h3>
                                <ImageUpload onChange={(imgs) => setNewImages(imgs)} />
                            </div>

                            {/* New images preview */}
                            {newImages.length > 0 && (
                                <div className="pt-3 border-t border-zinc-800/50">
                                    <h3 className="text-xs font-semibold text-zinc-400 mb-3">New uploads ({newImages.length})</h3>
                                    <div className="grid grid-cols-4 gap-2">
                                        {newImages.map((img) => (
                                            <div key={img.key} className="relative group rounded-lg overflow-hidden border border-emerald-500/40 bg-emerald-500/5">
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img src={img.url} alt="New" className="w-full aspect-square object-cover" />
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                    <span className="text-[10px] text-emerald-300 font-medium">New</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Meta info */}
                    <div className="bg-[#13131a] border border-zinc-800/70 rounded-2xl p-5 space-y-3">
                        <h2 className="text-sm font-semibold text-zinc-200 mb-3">Details</h2>
                        <div className="space-y-2.5 text-xs">
                            <div className="flex justify-between">
                                <span className="text-zinc-500">Product ID</span>
                                <span className="text-zinc-300 font-mono">#{product.id}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-zinc-500">Created</span>
                                <span className="text-zinc-300">{new Date(product.createdAt).toLocaleDateString("en-GB")}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-zinc-500">Updated</span>
                                <span className="text-zinc-300">{new Date(product.updatedAt).toLocaleDateString("en-GB")}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-zinc-500">Images</span>
                                <span className="text-zinc-300">{images.length}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Right: editable fields ── */}
                <div className="xl:col-span-2 space-y-5">

                    {/* Status — big visual picker */}
                    <div className="bg-[#13131a] border border-zinc-800/70 rounded-2xl overflow-hidden">
                        <div className="flex items-center gap-2.5 px-5 py-4 border-b border-zinc-800/70">
                            <div className="w-7 h-7 rounded-lg bg-zinc-800 flex items-center justify-center">
                                <Layers className="w-3.5 h-3.5 text-zinc-400" />
                            </div>
                            <h2 className="text-sm font-semibold text-zinc-200">Status</h2>
                            <span className={`ml-auto flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${cfg.bg} ${cfg.text}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                                {cfg.label}
                            </span>
                        </div>
                        <div className="p-5 grid grid-cols-3 gap-3">
                            {(["draft", "active", "archived"] as const).map((s) => {
                                const c = STATUS_CONFIG[s];
                                return (
                                    <button key={s} onClick={() => setStatus(s)}
                                        className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${status === s ? `border-current ${c.text} bg-white/[0.04]` : "border-zinc-800 text-zinc-500 hover:border-zinc-700"
                                            }`}>
                                        <span className={`w-3 h-3 rounded-full ${c.dot}`} />
                                        <span className="text-sm font-semibold capitalize">{s}</span>
                                        <span className="text-[10px] text-zinc-600 text-center leading-tight">
                                            {s === "draft" ? "Hidden from customers" : s === "active" ? "Visible & available" : "Hidden from store"}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Product info */}
                    <div className="bg-[#13131a] border border-zinc-800/70 rounded-2xl overflow-hidden">
                        <div className="flex items-center gap-2.5 px-5 py-4 border-b border-zinc-800/70">
                            <div className="w-7 h-7 rounded-lg bg-zinc-800 flex items-center justify-center">
                                <Package className="w-3.5 h-3.5 text-zinc-400" />
                            </div>
                            <h2 className="text-sm font-semibold text-zinc-200">Product Information</h2>
                        </div>
                        <div className="p-5 space-y-4">

                            {/* Name */}
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-zinc-300">Product Name <span className="text-indigo-400">*</span></label>
                                <input value={name} onChange={(e) => setName(e.target.value)}
                                    className="w-full bg-zinc-900/60 border border-zinc-700/60 text-sm text-zinc-200 placeholder:text-zinc-600 rounded-lg px-3 py-2.5 focus:outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/20 hover:border-zinc-600 transition-all" />
                            </div>

                            {/* Description */}
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-zinc-300">Description</label>
                                <div className="relative">
                                    <textarea value={description} onChange={(e) => setDescription(e.target.value)}
                                        rows={7}
                                        placeholder="Full product description..."
                                        className="w-full bg-zinc-900/60 border border-zinc-700/60 text-sm text-zinc-200 placeholder:text-zinc-600 rounded-lg px-3 py-2.5 focus:outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/20 hover:border-zinc-600 transition-all resize-none" />
                                    <span className="absolute bottom-2.5 right-3 text-[10px] text-zinc-600">{description.length} chars</span>
                                </div>
                            </div>

                            {/* URL */}
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-zinc-300 flex items-center gap-1.5">
                                    <Link2 className="w-3.5 h-3.5 text-zinc-500" />Product URL
                                    <span className="text-zinc-600 font-normal">(external link)</span>
                                </label>
                                <input value={url} onChange={(e) => setUrl(e.target.value)}
                                    placeholder="https://example.com/product-page"
                                    className="w-full bg-zinc-900/60 border border-zinc-700/60 text-sm text-zinc-200 placeholder:text-zinc-600 rounded-lg px-3 py-2.5 focus:outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/20 hover:border-zinc-600 transition-all" />
                                {url && (
                                    <a href={url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
                                        <ExternalLink className="w-3 h-3" />Preview link
                                    </a>
                                )}
                            </div>

                            {/* Tags */}
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-zinc-300 flex items-center gap-1.5">
                                    <Tag className="w-3.5 h-3.5 text-zinc-500" />Tags
                                    <span className="text-zinc-600 font-normal">(comma-separated)</span>
                                </label>
                                <input value={tags} onChange={(e) => setTags(e.target.value)}
                                    placeholder="laser, colour, a3, refurbished..."
                                    className="w-full bg-zinc-900/60 border border-zinc-700/60 text-sm text-zinc-200 placeholder:text-zinc-600 rounded-lg px-3 py-2.5 focus:outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/20 hover:border-zinc-600 transition-all" />
                                {tags && (
                                    <div className="flex gap-1.5 flex-wrap pt-1">
                                        {tags.split(",").map((t) => t.trim()).filter(Boolean).map((t) => (
                                            <span key={t} className="text-[11px] text-zinc-400 bg-zinc-800 border border-zinc-700 px-2 py-0.5 rounded-full">{t}</span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Pricing + Category */}
                    <div className="grid grid-cols-1  gap-5">
                        {/* Price */}
                        <div className="bg-[#13131a] border border-zinc-800/70 rounded-2xl overflow-hidden">
                            <div className="flex items-center gap-2.5 px-5 py-4 border-b border-zinc-800/70">
                                <div className="w-7 h-7 rounded-lg bg-zinc-800 flex items-center justify-center">
                                    <DollarSign className="w-3.5 h-3.5 text-zinc-400" />
                                </div>
                                <h2 className="text-sm font-semibold text-zinc-200">Price</h2>
                            </div>
                            <div className="p-5">
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-500">£</span>
                                    <input
                                        type="number" step="0.01" min="0"
                                        value={price} onChange={(e) => setPrice(e.target.value)}
                                        placeholder="0.00"
                                        className="w-full bg-zinc-900/60 border border-zinc-700/60 text-sm text-zinc-200 placeholder:text-zinc-600 rounded-lg pl-7 pr-3 py-2.5 focus:outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/20 hover:border-zinc-600 transition-all"
                                    />
                                </div>
                                <p className="text-xs text-zinc-600 mt-2">Leave empty for &quot;Price on application&quot;</p>
                            </div>
                        </div>
                        {/* Category */}
                        <div className="bg-[#13131a] border border-zinc-800/70 rounded-2xl overflow-hidden">
                            <div className="flex items-center gap-2.5 px-5 py-4 border-b border-zinc-800/70">
                                <div className="w-7 h-7 rounded-lg bg-zinc-800 flex items-center justify-center">
                                    <Tag className="w-3.5 h-3.5 text-zinc-400" />
                                </div>
                                <h2 className="text-sm font-semibold text-zinc-200">Category</h2>
                            </div>
                            <div className="p-5">
                                <div className="relative">
                                    <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}
                                        className="w-full appearance-none bg-zinc-900/60 border border-zinc-700/60 text-sm text-zinc-200 rounded-lg px-3 py-2.5 pr-8 focus:outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/20 hover:border-zinc-600 transition-all cursor-pointer">
                                        <option value="">Uncategorised</option>
                                        {categories.map((c) => (
                                            <option key={c.id} value={c.id}>{c.name}</option>
                                        ))}
                                    </select>
                                    <ChevronLeft className="absolute right-3 top-1/2 -translate-y-1/2 -rotate-90 w-4 h-4 text-zinc-500 pointer-events-none" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Save bar */}
                    {isDirty && (
                        <div className="sticky bottom-4 flex items-center justify-between gap-4 px-5 py-3.5 bg-zinc-900 border border-zinc-700 rounded-2xl shadow-2xl shadow-black/50 backdrop-blur-sm">
                            <p className="text-sm text-zinc-400">You have unsaved changes</p>
                            <div className="flex gap-2">
                                <button onClick={() => {
                                    setName(product.name); setDescription(product.description || "");
                                    setUrl(product.url || "");
                                    setPrice(product.price != null ? String(product.price) : "");
                                    setStatus(product.status); setTags(product.tags || "");
                                    setCategoryId(product.categoryId ? String(product.categoryId) : "");
                                    setNewImages([]);
                                    setEditedImages(product.images);
                                }} className="px-3 py-2 text-xs text-zinc-400 border border-zinc-700 hover:border-zinc-500 rounded-lg transition-all">
                                    Discard
                                </button>
                                <button onClick={handleSave} disabled={saving}
                                    className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white rounded-lg transition-all">
                                    {saving ? <><Loader2 className="w-3.5 h-3.5 animate-spin" />Saving...</> : <><Save className="w-3.5 h-3.5" />Save</>}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
