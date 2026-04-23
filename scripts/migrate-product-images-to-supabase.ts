import "dotenv/config";
import fs from "node:fs/promises";
import path from "node:path";
import {
  listProductImagesForMigration,
  updateProductImageKey,
  updateProductImageStorageLink,
} from "../lib/catalog-store";
import {
  PRODUCT_IMAGES_BUCKET,
  ensureProductImagesBucket,
  uploadProductImages,
} from "../lib/supabase-storage";

interface ProductImageRow {
  id: number;
  productId: number;
  url: string;
  key: string;
}

interface CliOptions {
  dryRun: boolean;
  productId?: number;
  limit?: number;
  sourceDir?: string;
}

interface SourceCandidate {
  label: string;
  file: File;
}

function parseArgs(argv: string[]): CliOptions {
  const options: CliOptions = { dryRun: false };

  for (const arg of argv) {
    if (arg === "--dry-run") {
      options.dryRun = true;
      continue;
    }

    if (arg.startsWith("--product-id=")) {
      const value = Number(arg.slice("--product-id=".length));
      if (!Number.isNaN(value) && value > 0) {
        options.productId = value;
      }
      continue;
    }

    if (arg.startsWith("--limit=")) {
      const value = Number(arg.slice("--limit=".length));
      if (!Number.isNaN(value) && value > 0) {
        options.limit = value;
      }
      continue;
    }

    if (arg.startsWith("--source-dir=")) {
      const value = arg.slice("--source-dir=".length).trim();
      if (value) {
        options.sourceDir = path.resolve(value);
      }
    }
  }

  return options;
}

function getFileNameFromValue(value: string) {
  try {
    const url = new URL(value);
    const pathname = decodeURIComponent(url.pathname);
    return path.basename(pathname) || `image-${crypto.randomUUID()}`;
  } catch {
    return path.basename(value) || `image-${crypto.randomUUID()}`;
  }
}

function inferContentType(fileName: string) {
  const ext = path.extname(fileName).toLowerCase();

  switch (ext) {
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".png":
      return "image/png";
    case ".webp":
      return "image/webp";
    case ".gif":
      return "image/gif";
    case ".heic":
      return "image/heic";
    case ".heif":
      return "image/heif";
    case ".svg":
      return "image/svg+xml";
    default:
      return "application/octet-stream";
  }
}

function isSupabaseStorageUrl(value: string) {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return Boolean(
    base &&
      value.startsWith(
        `${base}/storage/v1/object/public/${PRODUCT_IMAGES_BUCKET}/`
      )
  );
}

function extractStorageKeyFromUrl(value: string) {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const prefix = `${base}/storage/v1/object/public/${PRODUCT_IMAGES_BUCKET}/`;

  if (!base || !value.startsWith(prefix)) {
    return null;
  }

  return decodeURIComponent(value.slice(prefix.length));
}

async function collectFiles(
  dirPath: string,
  entries: Map<string, string[]>,
) {
  const items = await fs.readdir(dirPath, { withFileTypes: true });

  for (const item of items) {
    const absolutePath = path.join(dirPath, item.name);

    if (item.isDirectory()) {
      await collectFiles(absolutePath, entries);
      continue;
    }

    const basename = item.name.toLowerCase();
    const existing = entries.get(basename) ?? [];
    existing.push(absolutePath);
    entries.set(basename, existing);
  }
}

async function buildSourceIndex(sourceDir?: string) {
  const entries = new Map<string, string[]>();

  if (!sourceDir) {
    return entries;
  }

  await collectFiles(sourceDir, entries);
  return entries;
}

async function createFileFromBuffer(fileName: string, buffer: Buffer) {
  return new File([new Uint8Array(buffer)], fileName, {
    type: inferContentType(fileName),
  });
}

async function getRemoteSource(value: string): Promise<SourceCandidate | null> {
  const response = await fetch(value);
  if (!response.ok) {
    return null;
  }

  const fileName = getFileNameFromValue(value);
  const arrayBuffer = await response.arrayBuffer();
  return {
    label: value,
    file: new File([arrayBuffer], fileName, {
      type: response.headers.get("content-type") || inferContentType(fileName),
    }),
  };
}

async function getLocalSource(
  absolutePath: string,
): Promise<SourceCandidate | null> {
  try {
    const stats = await fs.stat(absolutePath);
    if (!stats.isFile()) {
      return null;
    }

    const fileName = path.basename(absolutePath);
    const buffer = await fs.readFile(absolutePath);
    return {
      label: absolutePath,
      file: await createFileFromBuffer(fileName, buffer),
    };
  } catch {
    return null;
  }
}

async function resolveSourceCandidate(
  image: ProductImageRow,
  sourceIndex: Map<string, string[]>,
): Promise<SourceCandidate | null> {
  if (/^https?:\/\//i.test(image.url)) {
    const remoteSource = await getRemoteSource(image.url);
    if (remoteSource) {
      return remoteSource;
    }
  }

  if (image.url && !/^https?:\/\//i.test(image.url)) {
    const absolutePath = path.isAbsolute(image.url)
      ? image.url
      : path.resolve(process.cwd(), image.url);
    const localSource = await getLocalSource(absolutePath);
    if (localSource) {
      return localSource;
    }
  }

  const candidateNames = new Set(
    [image.url, image.key]
      .filter(Boolean)
      .map((value) => getFileNameFromValue(value).toLowerCase()),
  );

  for (const name of candidateNames) {
    const matches = sourceIndex.get(name) ?? [];
    for (const match of matches) {
      const localSource = await getLocalSource(match);
      if (localSource) {
        return localSource;
      }
    }
  }

  return null;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));

  const sourceIndex = await buildSourceIndex(options.sourceDir);
  const images = await listProductImagesForMigration({
    productId: options.productId,
    limit: options.limit,
  });

  if (images.length === 0) {
    console.log("No ProductImage rows found to migrate.");
    return;
  }

  await ensureProductImagesBucket();

  let migrated = 0;
  let alreadyLinked = 0;
  let missingSource = 0;

  for (const image of images as ProductImageRow[]) {
    const existingStorageKey =
      image.key.startsWith("products/") && isSupabaseStorageUrl(image.url)
        ? image.key
        : extractStorageKeyFromUrl(image.url);

    if (existingStorageKey) {
      if (!options.dryRun && existingStorageKey !== image.key) {
        await updateProductImageKey(image.id, existingStorageKey);
      }

      alreadyLinked += 1;
      console.log(
        `[skip] image ${image.id} already points to Supabase Storage (${existingStorageKey})`,
      );
      continue;
    }

    const source = await resolveSourceCandidate(image, sourceIndex);
    if (!source) {
      missingSource += 1;
      console.log(
        `[missing] image ${image.id} product ${image.productId} has no resolvable source for "${image.url}"`,
      );
      continue;
    }

    if (options.dryRun) {
      migrated += 1;
      console.log(
        `[dry-run] image ${image.id} product ${image.productId} would upload from ${source.label}`,
      );
      continue;
    }

    const [uploaded] = await uploadProductImages([source.file]);
    await updateProductImageStorageLink(image.id, {
      key: uploaded.key,
      url: uploaded.url,
    });

    migrated += 1;
    console.log(
      `[migrated] image ${image.id} product ${image.productId} -> ${uploaded.key}`,
    );
  }

  console.log(
    JSON.stringify(
      {
        total: images.length,
        migrated,
        alreadyLinked,
        missingSource,
        dryRun: options.dryRun,
        sourceDir: options.sourceDir ?? null,
      },
      null,
      2,
    ),
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
