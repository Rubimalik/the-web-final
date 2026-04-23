import { NextRequest, NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/session";
import { deleteProductImages, uploadProductImages } from "@/lib/supabase-storage";

const MAX_FILES = 8;
const MAX_IMAGE_SIZE_BYTES = 8 * 1024 * 1024;

function isAllowedImageFile(file: File) {
  return file.type.startsWith("image/") || /\.(heic|heif)$/i.test(file.name);
}

export async function POST(req: NextRequest) {
  if (!(await requireAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const files = formData
      .getAll("files")
      .filter((entry): entry is File => entry instanceof File);

    if (files.length === 0) {
      return NextResponse.json(
        { error: "Please provide at least one image file" },
        { status: 400 }
      );
    }

    if (files.length > MAX_FILES) {
      return NextResponse.json(
        { error: `You can upload up to ${MAX_FILES} images at a time` },
        { status: 400 }
      );
    }

    const invalidFile = files.find((file) => !isAllowedImageFile(file));
    if (invalidFile) {
      return NextResponse.json(
        { error: `Unsupported file type: ${invalidFile.name}` },
        { status: 400 }
      );
    }

    const oversizedFile = files.find((file) => file.size > MAX_IMAGE_SIZE_BYTES);
    if (oversizedFile) {
      return NextResponse.json(
        { error: `${oversizedFile.name} exceeds the 8MB limit` },
        { status: 400 }
      );
    }

    const uploadedImages = await uploadProductImages(files);

    return NextResponse.json({ data: uploadedImages });
  } catch (err) {
    console.error("[POST /api/storage/upload]", err);
    return NextResponse.json(
      { error: "Failed to upload images" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  if (!(await requireAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const keys = Array.isArray(body?.keys)
      ? body.keys.filter((key: unknown): key is string => typeof key === "string")
      : [];

    if (keys.length === 0) {
      return NextResponse.json({ success: true });
    }

    await deleteProductImages(keys);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[DELETE /api/storage/upload]", err);
    return NextResponse.json(
      { error: "Failed to delete images" },
      { status: 500 }
    );
  }
}
