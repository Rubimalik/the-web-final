import { createSupabaseServiceRoleClient } from "@/lib/supabase";

export const PRODUCT_IMAGES_BUCKET = "product-images";

const MAX_IMAGE_SIZE_BYTES = 8 * 1024 * 1024;
const PRODUCT_IMAGES_PREFIX = "products";

export interface StoredImageUpload {
  url: string;
  key: string;
}

function sanitizeFileName(fileName: string) {
  const lastDotIndex = fileName.lastIndexOf(".");
  const extension = lastDotIndex >= 0 ? fileName.slice(lastDotIndex).toLowerCase() : "";
  const baseName = lastDotIndex >= 0 ? fileName.slice(0, lastDotIndex) : fileName;
  const safeBaseName =
    baseName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "image";

  return `${safeBaseName}${extension}`;
}

function buildStorageKey(fileName: string) {
  const now = new Date();
  const year = String(now.getFullYear());
  const month = String(now.getMonth() + 1).padStart(2, "0");

  return `${PRODUCT_IMAGES_PREFIX}/${year}/${month}/${crypto.randomUUID()}-${sanitizeFileName(fileName)}`;
}

function isManagedProductImageKey(key: string) {
  return key.startsWith(`${PRODUCT_IMAGES_PREFIX}/`);
}

export async function ensureProductImagesBucket() {
  const supabase = createSupabaseServiceRoleClient();
  const { data, error } = await supabase.storage.getBucket(PRODUCT_IMAGES_BUCKET);

  if (!error) {
    if (!data.public) {
      const { error: updateError } = await supabase.storage.updateBucket(
        PRODUCT_IMAGES_BUCKET,
        {
          public: true,
          fileSizeLimit: "8MB",
          allowedMimeTypes: ["image/*"],
        }
      );

      if (updateError) {
        throw updateError;
      }
    }

    return;
  }

  const { error: createError } = await supabase.storage.createBucket(
    PRODUCT_IMAGES_BUCKET,
    {
      public: true,
      fileSizeLimit: "8MB",
      allowedMimeTypes: ["image/*"],
    }
  );

  if (
    createError &&
    !createError.message.toLowerCase().includes("already exists")
  ) {
    throw createError;
  }
}

export async function uploadProductImages(files: File[]) {
  const supabase = createSupabaseServiceRoleClient();
  await ensureProductImagesBucket();

  const uploadedKeys: string[] = [];

  try {
    const results: StoredImageUpload[] = [];

    for (const file of files) {
      if (file.size > MAX_IMAGE_SIZE_BYTES) {
        throw new Error(`File "${file.name}" exceeds the 8MB limit`);
      }

      const key = buildStorageKey(file.name);
      const { error } = await supabase.storage
        .from(PRODUCT_IMAGES_BUCKET)
        .upload(key, file, {
          cacheControl: "3600",
          contentType: file.type || undefined,
          upsert: false,
        });

      if (error) {
        throw error;
      }

      uploadedKeys.push(key);

      const {
        data: { publicUrl },
      } = supabase.storage.from(PRODUCT_IMAGES_BUCKET).getPublicUrl(key);

      results.push({
        key,
        url: publicUrl,
      });
    }

    return results;
  } catch (error) {
    try {
      await deleteProductImages(uploadedKeys);
    } catch (cleanupError) {
      console.error("[Supabase Storage cleanup]", cleanupError);
    }

    throw error;
  }
}

export async function deleteProductImages(keys: string[]) {
  const deletableKeys = Array.from(
    new Set(
      keys
        .filter((key): key is string => typeof key === "string")
        .map((key) => key.trim())
        .filter((key) => key.length > 0 && isManagedProductImageKey(key))
    )
  );

  if (deletableKeys.length === 0) {
    return;
  }

  const supabase = createSupabaseServiceRoleClient();
  await ensureProductImagesBucket();

  const { error } = await supabase.storage
    .from(PRODUCT_IMAGES_BUCKET)
    .remove(deletableKeys);

  if (error) {
    throw error;
  }
}
