import { NextRequest, NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/session";
import { deleteProduct, getProductById, updateProduct } from "@/lib/catalog-store";
import { deleteProductImages } from "@/lib/supabase-storage";
import { z } from "zod";

const productImageSchema = z.object({
  url: z.string().url(),
  key: z.string(),
  isPrimary: z.boolean().optional().default(false),
});

const editedImageSchema = z.object({
  id: z.number().int().positive(),
  isPrimary: z.boolean().optional(),
});

const updateProductSchema = z.object({
  name: z.string().min(3).optional(),
  description: z.string().optional().nullable(),
  url: z.union([z.string().url(), z.literal(""), z.null()]).optional(),
  price: z.number().min(0).optional().nullable(),
  status: z.enum(["draft", "active", "archived"]).optional(),
  tags: z.string().optional().nullable(),
  categoryId: z.number().int().positive().optional().nullable(),
  images: z.array(productImageSchema).optional(),
  newImages: z.array(productImageSchema).optional(),
  editedImages: z.array(editedImageSchema).optional(),
});

function extractUploadedImageKeys(payload: unknown) {
  if (!Array.isArray(payload)) {
    return [];
  }

  return payload.flatMap((item) => {
    if (
      item &&
      typeof item === "object" &&
      "key" in item &&
      typeof item.key === "string"
    ) {
      return [item.key];
    }

    return [];
  });
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const productId = parseInt(id);
    if (isNaN(productId))
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });

    const product = await getProductById(productId);

    if (!product)
      return NextResponse.json({ error: "Product not found" }, { status: 404 });

    return NextResponse.json({ data: product });
  } catch (err) {
    console.error("[GET /api/product/:id]", err);
    return NextResponse.json({ error: "Failed to fetch product" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await requireAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let uploadedKeysToCleanup: string[] = [];

  try {
    const { id } = await params;
    const productId = parseInt(id);
    if (isNaN(productId))
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });

    const body = await req.json();
    uploadedKeysToCleanup = extractUploadedImageKeys(body?.newImages);

    const parsed = updateProductSchema.safeParse(body);
    if (!parsed.success) {
      if (uploadedKeysToCleanup.length > 0) {
        await deleteProductImages(uploadedKeysToCleanup);
      }

      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const {
      name,
      description,
      url,
      price,
      status,
      tags,
      categoryId,
      images,
      newImages,
      editedImages,
    } = parsed.data;

    const result = await updateProduct(productId, {
      name,
      description: description || null,
      url: url || null,
      price: price ?? null,
      status,
      tags: tags || null,
      categoryId: categoryId ?? null,
      images,
      newImages,
      editedImages,
    });

    if (!result?.product) {
      if (uploadedKeysToCleanup.length > 0) {
        await deleteProductImages(uploadedKeysToCleanup);
      }
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const updatedProduct = result.product;
    uploadedKeysToCleanup = [];

    if (result.imageKeysToDelete.length > 0) {
      try {
        await deleteProductImages(result.imageKeysToDelete);
      } catch (cleanupErr) {
        console.error("[PUT /api/product/:id cleanup]", cleanupErr);
      }
    }

    return NextResponse.json({
      data: updatedProduct,
      message: "Product updated successfully",
    });
  } catch (err) {
    console.error("[PUT /api/product/:id]", err);

    if (uploadedKeysToCleanup.length > 0) {
      try {
        await deleteProductImages(uploadedKeysToCleanup);
      } catch (cleanupErr) {
        console.error("[PUT /api/product/:id rollback cleanup]", cleanupErr);
      }
    }

    return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await requireAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const productId = parseInt(id);
    if (isNaN(productId))
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });

    const result = await deleteProduct(productId);

    if (!result) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    try {
      await deleteProductImages(result.imageKeys);
    } catch (cleanupErr) {
      console.error("[DELETE /api/product/:id cleanup]", cleanupErr);
    }

    return NextResponse.json({ message: "Product deleted successfully" });
  } catch (err) {
    console.error("[DELETE /api/product/:id]", err);
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
  }
}
