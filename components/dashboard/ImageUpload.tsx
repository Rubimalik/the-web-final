"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { Upload, X, Star, Loader2, CheckCircle2, GripVertical } from "lucide-react";

export interface UploadedImage {
  url: string;
  key: string;
  isPrimary: boolean;
  name: string;
}

interface ImageUploadProps {
  onChange?: (images: UploadedImage[]) => void;
  value?: UploadedImage[];
}

type UploadStatus = "idle" | "uploading" | "success" | "error";

interface PreviewImage {
  id: string;
  file: File;
  preview: string;
  status: UploadStatus;
  uploadedUrl?: string;
  uploadedKey?: string;
  isPrimary: boolean;
}

const MAX_FILES = 8;
const HEIC_CONVERSION_ERROR =
  "HEIC conversion failed. Please upload the image as JPG, PNG, or WEBP instead.";

async function uploadImages(files: File[]) {
  const formData = new FormData();

  files.forEach((file) => {
    formData.append("files", file);
  });

  const res = await fetch("/api/storage/upload", {
    method: "POST",
    body: formData,
  });
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Upload failed");
  }

  return Array.isArray(data.data)
    ? (data.data as Array<{ url: string; key: string }>)
    : [];
}

async function deleteUploadedImages(keys: string[]) {
  if (keys.length === 0) {
    return;
  }

  try {
    await fetch("/api/storage/upload", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ keys }),
    });
  } catch (err) {
    console.error("Failed to delete uploaded image:", err);
  }
}

export function ImageUpload({ onChange }: ImageUploadProps) {
  const [previews, setPreviews] = useState<PreviewImage[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const [uploadFeedback, setUploadFeedback] = useState("");
  const dragDepthRef = useRef(0);
  const previewsRef = useRef<PreviewImage[]>([]);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    previewsRef.current = previews;
  }, [previews]);

  useEffect(() => {
    return () => {
      previewsRef.current.forEach((preview) => URL.revokeObjectURL(preview.preview));
    };
  }, []);

  const notify = useCallback(
    (updated: PreviewImage[]) => {
      const uploaded = updated
        .filter((p) => p.uploadedUrl && p.uploadedKey)
        .map((p) => ({
          url: p.uploadedUrl!,
          key: p.uploadedKey!,
          isPrimary: p.isPrimary,
          name: p.file.name,
        }));
      onChange?.(uploaded);
    },
    [onChange]
  );

  const syncPrimaryToFirst = useCallback((images: PreviewImage[]) => {
    return images.map((image, index) => ({
      ...image,
      isPrimary: index === 0,
    }));
  }, []);

  const moveImageToFront = useCallback(
    (images: PreviewImage[], id: string) => {
      const from = images.findIndex((image) => image.id === id);
      if (from === -1) {
        return images;
      }

      const reordered = [...images];
      const [selected] = reordered.splice(from, 1);
      reordered.unshift(selected);
      return syncPrimaryToFirst(reordered);
    },
    [syncPrimaryToFirst]
  );

  const handleUpload = useCallback(
    async (files: File[]) => {
      const hasNoExistingPreviews = previewsRef.current.length === 0;

      const newPreviews: PreviewImage[] = files.map((file, i) => ({
        id: `${Date.now()}-${i}`,
        file,
        preview: URL.createObjectURL(file),
        status: "uploading",
        isPrimary: hasNoExistingPreviews && i === 0,
      }));

      setPreviews((prev) => [...prev, ...newPreviews]);
      setIsUploading(true);

      try {
        const results = await uploadImages(files);

        setPreviews((prev) => {
          const updated = prev.map((p) => {
            const newIdx = newPreviews.findIndex((np) => np.id === p.id);
            if (newIdx === -1) return p;

            const result = results?.[newIdx];
            if (result) {
              return {
                ...p,
                status: "success" as UploadStatus,
                uploadedUrl: result.url,
                uploadedKey: result.key,
              };
            }
            return { ...p, status: "error" as UploadStatus };
          });
          notify(updated);
          return updated;
        });
      } catch (err) {
        console.error("Upload failed:", err);
        setUploadFeedback("Upload failed. Please verify the Supabase storage configuration and try again.");
        setPreviews((prev) =>
          prev.map((p) =>
            newPreviews.find((np) => np.id === p.id)
              ? { ...p, status: "error" as UploadStatus }
              : p
          )
        );
      } finally {
        setIsUploading(false);
      }
    },
    [notify]
  );

  // ✅ Dynamic import — only runs in browser, never on server
  const convertHeicToJpeg = async (file: File): Promise<File> => {
    const isHeic =
      file.type === "image/heic" ||
      file.type === "image/heif" ||
      file.name.toLowerCase().endsWith(".heic") ||
      file.name.toLowerCase().endsWith(".heif");

    if (!isHeic) return file;

    const heic2any = (await import("heic2any")).default;
    const converted = await heic2any({
      blob: file,
      toType: "image/jpeg",
      quality: 0.9,
    });

    const blob = Array.isArray(converted) ? converted[0] : converted;
    if (!(blob instanceof Blob)) {
      throw new Error(HEIC_CONVERSION_ERROR);
    }

    const newName = file.name
      .replace(/\.heic$/i, ".jpg")
      .replace(/\.heif$/i, ".jpg");
    return new File([blob], newName, { type: "image/jpeg" });
  };

  const handleFiles = async (fileList: FileList | File[]) => {
    setUploadFeedback("");

    const raw = Array.from(fileList).filter(
      (f) =>
        f.type.startsWith("image/") ||
        f.name.toLowerCase().endsWith(".heic") ||
        f.name.toLowerCase().endsWith(".heif")
    );
    if (raw.length === 0) {
      setUploadFeedback("Drop image files only: JPG, PNG, WEBP, or HEIC.");
      return;
    }

    const availableSlots = MAX_FILES - previews.length;
    if (availableSlots <= 0) {
      setUploadFeedback(`You can upload up to ${MAX_FILES} images per product.`);
      return;
    }

    const limitedFiles = raw.slice(0, availableSlots);
    if (limitedFiles.length < raw.length) {
      setUploadFeedback(`Only ${availableSlots} more image${availableSlots === 1 ? "" : "s"} can be added to this product.`);
    } else {
      setUploadFeedback("");
    }

    const preparedFiles = await Promise.allSettled(
      limitedFiles.map(async (file) => {
        try {
          return await convertHeicToJpeg(file);
        } catch (err) {
          console.error("HEIC conversion failed:", err);
          throw new Error(`${file.name}: ${HEIC_CONVERSION_ERROR}`);
        }
      })
    );

    const files = preparedFiles.flatMap((result) =>
      result.status === "fulfilled" ? [result.value] : []
    );

    const conversionErrors = preparedFiles.flatMap((result) =>
      result.status === "rejected" ? [result.reason instanceof Error ? result.reason.message : HEIC_CONVERSION_ERROR] : []
    );

    if (conversionErrors.length > 0) {
      setUploadFeedback(conversionErrors[0]);
    }

    if (files.length === 0) {
      return;
    }

    void handleUpload(files);
  };

  const handleRemove = (id: string) => {
    const removedImage = previewsRef.current.find((preview) => preview.id === id);
    if (removedImage?.uploadedKey) {
      void deleteUploadedImages([removedImage.uploadedKey]);
    }

    setPreviews((prev) => {
      const removed = prev.find((p) => p.id === id);
      if (removed) URL.revokeObjectURL(removed.preview);

      const filtered = prev.filter((p) => p.id !== id);
      const updated = filtered.length > 0 && !filtered.some((p) => p.isPrimary)
        ? syncPrimaryToFirst(filtered)
        : filtered;

      if (updated.length < MAX_FILES) {
        setUploadFeedback("");
      }
      notify(updated);
      return updated;
    });
  };

  const handleSetPrimary = (id: string) => {
    setPreviews((prev) => {
      const updated = moveImageToFront(prev, id);
      notify(updated);
      return updated;
    });
  };

  const handleReorderDragStart = (e: React.DragEvent, id: string) => {
    e.stopPropagation();
    setDraggedId(id);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleReorderDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = "move";
    if (id !== draggedId) setDragOverId(id);
  };

  const handleReorderDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!draggedId || draggedId === targetId) {
      setDraggedId(null);
      setDragOverId(null);
      return;
    }
    setPreviews((prev) => {
      const from = prev.findIndex((p) => p.id === draggedId);
      const to = prev.findIndex((p) => p.id === targetId);
      if (from === -1 || to === -1) return prev;
      const updated = [...prev];
      const [item] = updated.splice(from, 1);
      updated.splice(to, 0, item);
      const normalized = syncPrimaryToFirst(updated);
      notify(normalized);
      return normalized;
    });
    setDraggedId(null);
    setDragOverId(null);
  };

  const handleReorderDragEnd = () => {
    setDraggedId(null);
    setDragOverId(null);
  };

  const isFileDrag = (event: React.DragEvent) =>
    Array.from(event.dataTransfer?.types ?? []).includes("Files");

  const resetDropzone = () => {
    dragDepthRef.current = 0;
    setIsDragging(false);
  };

  return (
    <div className="space-y-3">
      {/* Drop zone */}
      <div
        onDragEnter={(e) => {
          if (!isFileDrag(e) || isUploading) return;
          e.preventDefault();
          dragDepthRef.current += 1;
          setIsDragging(true);
        }}
        onDragOver={(e) => {
          if (!isFileDrag(e) || isUploading) return;
          e.preventDefault();
          e.dataTransfer.dropEffect = "copy";
          setIsDragging(true);
        }}
        onDragLeave={(e) => {
          if (!isFileDrag(e)) return;
          e.preventDefault();
          dragDepthRef.current = Math.max(0, dragDepthRef.current - 1);
          if (dragDepthRef.current === 0) {
            setIsDragging(false);
          }
        }}
        onDrop={(e) => {
          if (!isFileDrag(e) || isUploading) return;
          e.preventDefault();
          resetDropzone();
          handleFiles(e.dataTransfer.files);
        }}
        onClick={() => !isUploading && inputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 cursor-pointer group ${
          isDragging
            ? "border-indigo-500 bg-indigo-500/10"
            : isUploading
            ? "border-zinc-600 bg-zinc-800/20 cursor-not-allowed"
            : "border-zinc-700/60 hover:border-zinc-600 hover:bg-zinc-800/30"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*,.heic,.heif"
          multiple
          className="hidden"
          disabled={isUploading}
          onChange={(e) => {
            if (e.target.files) {
              void handleFiles(e.target.files);
            }
            e.currentTarget.value = "";
          }}
        />
        <div className="flex flex-col items-center gap-3">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
            isDragging ? "bg-indigo-500/20 text-indigo-400"
            : isUploading ? "bg-zinc-800 text-zinc-500"
            : "bg-zinc-800 text-zinc-500 group-hover:text-zinc-300"
          }`}>
            {isUploading
              ? <Loader2 className="w-6 h-6 animate-spin" />
              : <Upload className="w-6 h-6" />
            }
          </div>
          <div>
            <p className="text-sm font-medium text-zinc-300">
              {isUploading
                ? "Uploading..."
                : <><span>Drop images here or </span><span className="text-indigo-400">browse</span></>
              }
            </p>
            <p className="text-xs text-zinc-600 mt-1">
              PNG, JPG, WEBP, HEIC · Up to 8MB each · Max {MAX_FILES} images · HEIC converted to JPG before upload
            </p>
          </div>
        </div>
      </div>

      {uploadFeedback && (
        <p className="text-xs text-amber-400">{uploadFeedback}</p>
      )}

      {/* Preview grid */}
      {previews.length > 0 && (
        <>
          <div className="flex items-center justify-between gap-3 text-xs">
            <p className="text-zinc-500">Drag images to reorder. The first image is used as the primary cover.</p>
            <p className="text-zinc-600">{previews.length}/{MAX_FILES}</p>
          </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {previews.map((img) => (
            <div
              key={img.id}
              draggable
              onDragStart={(e) => handleReorderDragStart(e, img.id)}
              onDragOver={(e) => handleReorderDragOver(e, img.id)}
              onDrop={(e) => handleReorderDrop(e, img.id)}
              onDragEnd={handleReorderDragEnd}
              onDragLeave={() => setDragOverId(null)}
              className={`relative group rounded-xl overflow-hidden border aspect-square transition-all cursor-grab active:cursor-grabbing ${draggedId === img.id
                  ? "opacity-40 scale-95"
                  : dragOverId === img.id
                    ? "border-indigo-400 ring-2 ring-indigo-400/40 scale-105"
                    : img.isPrimary
                  ? "border-indigo-500/70 ring-1 ring-indigo-500/30"
                  : "border-zinc-800 hover:border-zinc-600"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.preview} alt="Preview" className="w-full h-full object-cover" />

              {img.status === "uploading" && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                  <Loader2 className="w-6 h-6 text-white animate-spin" />
                </div>
              )}

              {img.status === "success" && (
                <div className="absolute top-2 right-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 drop-shadow" />
                </div>
              )}

              {img.status === "error" && (
                <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                  <p className="text-red-400 text-xs font-medium px-2 text-center">Upload failed</p>
                </div>
              )}

              {/* Drag handle */}
              <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                <div className="w-6 h-6 rounded bg-black/50 flex items-center justify-center">
                  <GripVertical className="w-3.5 h-3.5 text-white/70" />
                </div>
              </div>

              {img.status !== "uploading" && (
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  {!img.isPrimary && img.status === "success" && (
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); handleSetPrimary(img.id); }}
                      className="w-8 h-8 rounded-lg bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 flex items-center justify-center hover:bg-yellow-500/30 transition-colors"
                    >
                      <Star className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); handleRemove(img.id); }}
                    className="w-8 h-8 rounded-lg bg-red-500/20 text-red-400 border border-red-500/30 flex items-center justify-center hover:bg-red-500/30 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {img.isPrimary && (
                <div className="absolute top-2 left-2 flex items-center gap-1 bg-indigo-600/90 text-white text-[10px] font-medium px-2 py-0.5 rounded-full">
                  <Star className="w-2.5 h-2.5 fill-current" />Primary
                </div>
              )}

              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent px-2 py-2">
                <p className="text-[10px] text-zinc-300 truncate">{img.file.name}</p>
              </div>
            </div>
          ))}
        </div>
        </>
      )}

      {previews.length > 0 && (
        <p className="text-xs text-zinc-600">
          {previews.filter((p) => p.status === "success").length} of {previews.length} uploaded
          {isUploading && " · Uploading..."}
        </p>
      )}
    </div>
  );
}
