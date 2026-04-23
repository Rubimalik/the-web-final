import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const productId = parseInt(id);
    if (isNaN(productId))
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });

    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        images:   { orderBy: { order: "asc" } },
        category: { select: { id: true, name: true, slug: true } },
      },
    });

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
  try {
    const { id } = await params;
    const productId = parseInt(id);
    if (isNaN(productId))
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });

    const body = await req.json();
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
    } = body;

    const data: Record<string, unknown> = {};
    if (name !== undefined) data.name = name;
    if (description !== undefined) data.description = description || null;
    if (url !== undefined) data.url = url || null;
    if (price !== undefined) data.price = price ?? null;
    if (status !== undefined) data.status = status;
    if (tags !== undefined) data.tags = tags || null;
    if (categoryId !== undefined) data.categoryId = categoryId ?? null;

    if (images !== undefined) {
      data.images = {
        deleteMany: {},
        create: images.map(
          (
            img: { url: string; key: string; isPrimary?: boolean },
            i: number,
          ) => ({
            url: img.url,
            key: img.key,
            isPrimary: img.isPrimary ?? i === 0,
          }),
        ),
      };
    }

    const product = await prisma.product.update({
      where: { id: productId },
      data: data as never,
      include: {
        images: { orderBy: { order: "asc" } },
        category: { select: { id: true, name: true, slug: true } },
      },
    });

    // Handle reordering and deletion of existing images
    if (editedImages !== undefined && editedImages.length > 0) {
      const existingImageIds = new Set(
        editedImages.map((img: { id: number }) => img.id),
      );
      const currentImages = await prisma.productImage.findMany({
        where: { productId },
      });
      const imagesToDelete = currentImages.filter(
        (img) => !existingImageIds.has(img.id),
      );

      if (imagesToDelete.length > 0) {
        await prisma.productImage.deleteMany({
          where: { id: { in: imagesToDelete.map((img) => img.id) } },
        });
      }

      // Update isPrimary and order for all images based on new order
      for (let i = 0; i < editedImages.length; i++) {
        await prisma.productImage.update({
          where: { id: editedImages[i].id },
          data: { isPrimary: i === 0, order: i },
        });
      }
    }

    // If newImages are provided, append them to existing images
    if (newImages !== undefined && newImages.length > 0) {
      // Find the current max order so new images go at the end
      const maxOrder = await prisma.productImage.aggregate({
        where: { productId },
        _max: { order: true },
      });
      const startOrder = (maxOrder._max.order ?? -1) + 1;
      await prisma.productImage.createMany({
        data: newImages.map(
          (img: { url: string; key: string; isPrimary?: boolean }, i: number) => ({
            productId,
            url: img.url,
            key: img.key,
            isPrimary: false,
            order: startOrder + i,
          }),
        ),
      });
    }

    // Fetch updated product with new image order
    const updatedProduct = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        images: { orderBy: { order: "asc" } },
        category: { select: { id: true, name: true, slug: true } },
      },
    });

    return NextResponse.json({
      data: updatedProduct,
      message: "Product updated successfully",
    });
  } catch (err) {
    console.error("[PUT /api/product/:id]", err);
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const productId = parseInt(id);
    if (isNaN(productId))
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });

    await prisma.$transaction([
      prisma.productImage.deleteMany({ where: { productId } }),
      prisma.product.delete({ where: { id: productId } }),
    ]);

    return NextResponse.json({ message: "Product deleted successfully" });
  } catch (err) {
    console.error("[DELETE /api/product/:id]", err);
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
  }
}