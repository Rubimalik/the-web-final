import { NextRequest, NextResponse } from "next/server";
import { deleteProduct, getProductById, updateProduct, filterPublicProduct } from "@/lib/catalog-store";
import { deleteProductImages } from "@/lib/supabase-storage";
import { safeReadRequestJson } from "@/lib/safe-json";
import { z } from "zod";
import { getAuthenticatedProfile } from "@/lib/auth/getAuthenticatedProfile";
import { isApprovedAdmin } from "@/lib/admin-auth";

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
  dealerPrice: z.number().min(0).optional().nullable(),
  dealerNotes: z.string().optional().nullable(),
  visibility: z.enum(["public", "dealer", "both"]).optional(),
  status: z.enum(["draft", "active", "archived"]).optional(),
  isFeatured: z.boolean().optional(),
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
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const productId = Number.parseInt(id, 10);
    if (isNaN(productId))
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });

    const forcePublicView = new URL(req.url).searchParams.get("public") === "1";
    const auth = await getAuthenticatedProfile({ sessionKind: "admin" });
    const isAdmin = !forcePublicView && isApprovedAdmin(auth);

    const product = await getProductById(
      productId,
      isAdmin ? {} : { allowedVisibilities: ["public", "both"] },
    );

    if (!product || (!isAdmin && product.status !== "active"))
      return NextResponse.json({ error: "Product not found" }, { status: 404 });

    return NextResponse.json({ data: isAdmin ? product : filterPublicProduct(product) });
  } catch (err) {
    console.error("[GET /api/product/:id]", err);
    return NextResponse.json({ error: "Failed to fetch product" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await getAuthenticatedProfile({ sessionKind: "admin" });
  if (!isApprovedAdmin(auth)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let uploadedKeysToCleanup: string[] = [];

  try {
    const { id } = await params;
    const productId = Number.parseInt(id, 10);
    if (isNaN(productId))
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });

    const body = await safeReadRequestJson(req, "PUT /api/product/:id");
    if (!body) {
      return NextResponse.json({ error: "Invalid or empty request body" }, { status: 400 });
    }
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
      dealerPrice,
      dealerNotes,
      visibility,
      status,
      isFeatured,
      tags,
      categoryId,
      images,
      newImages,
      editedImages,
    } = parsed.data;

    const result = await updateProduct(productId, {
      name,
      description: description ?? undefined,
      url: url ?? undefined,
      price,
      dealerPrice,
      dealerNotes: dealerNotes ?? undefined,
      visibility,
      status,
      isFeatured,
      tags: tags ?? undefined,
      categoryId: categoryId ?? undefined,
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
  const auth = await getAuthenticatedProfile({ sessionKind: "admin" });
  if (!isApprovedAdmin(auth)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const productId = Number.parseInt(id, 10);
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
