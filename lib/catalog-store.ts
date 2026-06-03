import type { Pool, PoolClient } from "pg";
import { pool, query, withTransaction } from "@/lib/db";
import {
  CONSUMABLE_CATEGORY_SLUGS,
  PRODUCT_CATEGORY_SEEDS,
  getConsumableTypeSlugsForGroup,
  getConsumablesSlugs,
  getPartsBrandBySlug,
  getPartsLeafCategory,
  getPartsTypeBySlug,
  isKonicaMinoltaProduct,
  normalizeProductSlug,
  slugifyProductName,
} from "@/lib/product-taxonomy";

type DbExecutor = Pick<Pool, "query"> | PoolClient;

export type ProductStatus = "draft" | "active" | "archived";
export type ProductVisibility = "public" | "dealer" | "both";
type StoredProductVisibility = ProductVisibility | "public_and_dealer";

export interface CategorySummary {
  id: number;
  name: string;
  slug: string;
}

export interface CategoryRecord extends CategorySummary {
  createdAt: Date;
  updatedAt: Date;
  _count: {
    products: number;
  };
}

export interface ProductImageRecord {
  id: number;
  productId: number;
  url: string;
  key: string;
  isPrimary: boolean;
  order: number;
  createdAt: Date;
}

export interface ProductRecord {
  id: number;
  slug: string;
  name: string;
  description: string | null;
  url: string | null;
  price: number | null;
  dealerPrice: number | null;
  dealerNotes: string | null;
  visibility: ProductVisibility;
  status: string;
  isFeatured: boolean;
  featuredOrder: number | null;
  tags: string | null;
  categoryId: number | null;
  createdAt: Date;
  updatedAt: Date;
  images: ProductImageRecord[];
  category: CategorySummary | null;
}

// Public-safe product type (excludes dealer fields)
export interface PublicProductRecord {
  id: number;
  slug: string;
  name: string;
  description: string | null;
  url: string | null;
  price: number | null;
  status: string;
  isFeatured: boolean;
  featuredOrder: number | null;
  tags: string | null;
  categoryId: number | null;
  createdAt: Date;
  updatedAt: Date;
  images: ProductImageRecord[];
  category: CategorySummary | null;
}

export function filterPublicProduct(product: ProductRecord): PublicProductRecord {
  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    description: product.description,
    url: product.url,
    price: product.price,
    status: product.status,
    isFeatured: product.isFeatured,
    featuredOrder: product.featuredOrder,
    tags: product.tags,
    categoryId: product.categoryId,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
    images: product.images,
    category: product.category,
  };
}

export interface ProductListResult {
  data: ProductRecord[];
  total: number;
}

export interface DashboardOverview {
  totalProducts: number;
  activeProducts: number;
  draftProducts: number;
  archivedProducts: number;
  totalCategories: number;
  recentProducts: ProductRecord[];
}

export interface DashboardIssueProduct {
  id: number;
  name: string;
  updatedAt: Date;
}

export interface DashboardNotificationSummary {
  totalProducts: number;
  draftProducts: number;
  uncategorizedProducts: DashboardIssueProduct[];
  uncategorizedCount: number;
  productsWithoutImages: DashboardIssueProduct[];
  productsWithoutImagesCount: number;
}

export interface ProductInputImage {
  url: string;
  key: string;
  isPrimary?: boolean;
}

export interface ProductListFilters {
  page: number;
  limit: number;
  status?: string;
  isFeatured?: boolean;
  search?: string;
  categoryId?: number;
  slug?: string;
  slugs?: string[];
  consumableGroup?: string;
  consumableBrand?: string;
  consumableType?: string;
  allowedVisibilities?: ProductVisibility[];
  excludeKonicaMinolta?: boolean;
}

export interface CreateProductInput {
  name: string;
  description?: string | null;
  url?: string | null;
  price?: number | null;
  dealerPrice?: number | null;
  dealerNotes?: string | null;
  visibility?: ProductVisibility;
  status: ProductStatus;
  isFeatured?: boolean;
  tags?: string | null;
  categoryId?: number | null;
  images: ProductInputImage[];
}

export interface UpdateProductInput {
  name?: string;
  description?: string | null;
  url?: string | null;
  price?: number | null;
  dealerPrice?: number | null;
  dealerNotes?: string | null;
  visibility?: ProductVisibility;
  status?: string;
  isFeatured?: boolean;
  tags?: string | null;
  categoryId?: number | null;
  images?: ProductInputImage[];
  newImages?: ProductInputImage[];
  editedImages?: Array<{ id: number; isPrimary?: boolean }>;
}

export interface ProductImageMigrationRow {
  id: number;
  productId: number;
  url: string;
  key: string;
}

interface ProductRow {
  id: number;
  name: string;
  description: string | null;
  url: string | null;
  price: number | null;
  dealerPrice: number | null;
  dealerNotes: string | null;
  visibility: StoredProductVisibility | null;
  status: string;
  isFeatured: boolean;
  featuredOrder: number | null;
  tags: string | null;
  categoryId: number | null;
  createdAt: Date;
  updatedAt: Date;
  category: CategorySummary | null;
  images: ProductImageRecord[] | null;
}

function normalizeProductVisibility(value: unknown): ProductVisibility {
  if (value === "dealer") return "dealer";
  if (value === "both" || value === "public_and_dealer") return "both";
  return "public";
}

function buildVisibilityCondition(
  column: string,
  values: ProductVisibility[],
  params: unknown[],
) {
  const expanded = new Set<StoredProductVisibility>(values);

  if (expanded.has("both")) {
    expanded.add("public_and_dealer");
  }

  params.push(Array.from(expanded));
  const index = params.length;
  const clauses = [`${column} = ANY($${index})`];

  if (expanded.has("public")) {
    clauses.push(`${column} IS NULL`);
  }

  return `(${clauses.join(" OR ")})`;
}

function normalizeImages<T extends { isPrimary?: boolean | null }>(
  images: T[],
  fallbackPrimaryIndex = 0,
) {
  if (images.length === 0) {
    return [];
  }

  const firstExplicitPrimaryIndex = images.findIndex((image) => image.isPrimary);
  const primaryIndex =
    firstExplicitPrimaryIndex >= 0 ? firstExplicitPrimaryIndex : fallbackPrimaryIndex;

  return images.map((image, index) => ({
    ...image,
    isPrimary: index === primaryIndex,
  }));
}

function mapProductRow(row: ProductRow): ProductRecord {
  return {
    id: row.id,
    slug: slugifyProductName(row.name),
    name: row.name,
    description: row.description,
    url: row.url,
    price: row.price == null ? null : Number(row.price),
    dealerPrice: row.dealerPrice == null ? null : Number(row.dealerPrice),
    dealerNotes: row.dealerNotes,
    visibility: normalizeProductVisibility(row.visibility),
    status: row.status,
    isFeatured: row.isFeatured,
    featuredOrder: row.featuredOrder,
    tags: row.tags,
    categoryId: row.categoryId,
    createdAt: new Date(row.createdAt),
    updatedAt: new Date(row.updatedAt),
    category: row.category,
    images: Array.isArray(row.images)
      ? row.images.map((image) => ({
          id: image.id,
          productId: image.productId,
          url: image.url,
          key: image.key,
          isPrimary: image.isPrimary,
          order: "order" in image && typeof image.order === "number" ? image.order : 0,
          createdAt: new Date(image.createdAt),
        }))
      : [],
  };
}

function buildProductWhereClause(
  filters: Omit<ProductListFilters, "page" | "limit">,
  params: unknown[],
) {
  const conditions: string[] = [];

  if (filters.status) {
    params.push(filters.status);
    conditions.push(`p."status" = $${params.length}`);
  }

  if (typeof filters.isFeatured === "boolean") {
    params.push(filters.isFeatured);
    conditions.push(`p."isFeatured" = $${params.length}`);
  }

  if (typeof filters.categoryId === "number") {
    params.push(filters.categoryId);
    conditions.push(`p."categoryId" = $${params.length}`);
  }

  if (filters.slug) {
    params.push(filters.slug);
    conditions.push(`c."slug" = $${params.length}`);
  }

  if (filters.slugs && filters.slugs.length > 0) {
    params.push(filters.slugs);
    conditions.push(`c."slug" = ANY($${params.length})`);
  }

  const selectedConsumableType = getPartsTypeBySlug(filters.consumableType);
  const consumableTypeSlugs = selectedConsumableType
    ? [selectedConsumableType.slug]
    : filters.consumableGroup
      ? getConsumableTypeSlugsForGroup(filters.consumableGroup)
      : [];

  const consumableBrand = getPartsBrandBySlug(filters.consumableBrand);

  if (consumableBrand || consumableTypeSlugs.length > 0) {
    const exactLeafSlugs = consumableBrand
      ? (consumableTypeSlugs.length > 0
        ? consumableTypeSlugs
            .map((typeSlug) => getPartsLeafCategory(consumableBrand.slug, typeSlug)?.slug)
            .filter((slug): slug is string => Boolean(slug))
        : getConsumablesSlugs(consumableBrand.slug))
      : consumableTypeSlugs.flatMap((typeSlug) => getConsumablesSlugs(null, typeSlug));

    const legacyConsumableSlugs = [
      "consumables",
      "parts-and-toner",
      ...consumableTypeSlugs,
    ];
    params.push(exactLeafSlugs);
    const exactLeafSlugIndex = params.length;
    params.push(legacyConsumableSlugs);
    const legacySlugIndex = params.length;
    const typeKeywordConditions = consumableTypeSlugs.length > 0
      ? buildConsumableKeywordConditions(consumableTypeSlugs, "p.\"name\"", "p.\"tags\"", params)
      : "TRUE";
    const typeExclusionConditions = consumableTypeSlugs.length > 0
      ? buildConsumableTypeExclusionConditions(consumableTypeSlugs, "p.\"name\"", params)
      : "TRUE";
    const brandKeywordConditions = consumableBrand
      ? buildConsumableBrandKeywordConditions(consumableBrand.slug, "p.\"name\"", "p.\"tags\"", params)
      : "TRUE";

    conditions.push(
      `(
        c."slug" = ANY($${exactLeafSlugIndex})
        OR (
          c."slug" = ANY($${legacySlugIndex})
          AND (${brandKeywordConditions})
          AND (${typeKeywordConditions})
          AND (${typeExclusionConditions})
        )
      )`,
    );
  } else if (filters.consumableGroup === "all" || filters.consumableType === "all") {
    params.push(CONSUMABLE_CATEGORY_SLUGS);
    conditions.push(`c."slug" = ANY($${params.length})`);
  }

  if (filters.search) {
    params.push(`%${filters.search}%`);
    const tokenIndex = params.length;
    conditions.push(
      `(p."name" ILIKE $${tokenIndex} OR p."description" ILIKE $${tokenIndex} OR p."tags" ILIKE $${tokenIndex})`,
    );
  }

  if (filters.allowedVisibilities && filters.allowedVisibilities.length > 0) {
    conditions.push(buildVisibilityCondition(`p."visibility"`, filters.allowedVisibilities, params));
  }

  if (filters.excludeKonicaMinolta) {
    conditions.push(buildKonicaMinoltaExclusionCondition(params));
  }

  if (conditions.length === 0) {
    return "";
  }

  return `WHERE ${conditions.join(" AND ")}`;
}

function buildKonicaMinoltaExclusionCondition(params: unknown[]) {
  const fields = [
    `p."name"`,
    `p."description"`,
    `p."tags"`,
    `c."name"`,
    `c."slug"`,
  ];
  const keywords = ["konica", "minolta", "bizhub"];

  return keywords
    .map((keyword) => {
      params.push(`%${keyword}%`);
      const index = params.length;
      return fields.map((field) => `COALESCE(${field}, '') NOT ILIKE $${index}`).join(" AND ");
    })
    .join(" AND ");
}

function buildConsumableKeywordConditions(
  slugs: string[],
  nameColumn: string,
  tagsColumn: string,
  params: unknown[],
) {
  const keywordMap: Record<string, string[]> = {
    toner: ["toner", "toner cartridge"],
    "waste-toner-bottles": ["waste toner", "waste bottle", "waste toner bottle"],
    parts: ["part", "parts", "fuser", "fusing", "belt", "roller", "unit", "screen", "hdd", "ssd", "charge"],
    "drum-units": ["drum", "pcu", "pcdu", "photoconductor", "developer unit"],
    staples: ["staple", "staples"],
  };
  const keywords = Array.from(new Set(slugs.flatMap((slug) => keywordMap[slug] ?? [slug])));

  if (keywords.length === 0) {
    params.push("%__no_consumable_match__%");
    return `${nameColumn} ILIKE $${params.length}`;
  }

  return keywords
    .map((keyword) => {
      params.push(`%${keyword}%`);
      const index = params.length;
      return `(${nameColumn} ILIKE $${index} OR ${tagsColumn} ILIKE $${index})`;
    })
    .join(" OR ");
}

function buildConsumableTypeExclusionConditions(
  slugs: string[],
  nameColumn: string,
  params: unknown[],
) {
  const conflictMap: Record<string, string[]> = {
    toner: ["waste toner", "waste bottle", "drum", "staple", "part", "fuser", "roller"],
    "waste-toner-bottles": ["drum", "staple", "fuser", "roller"],
    parts: ["toner", "waste toner", "drum", "staple"],
    "drum-units": ["waste toner", "waste bottle", "staple", "toner cartridge"],
    staples: ["toner", "waste toner", "drum", "fuser", "roller"],
  };
  const conflicts = Array.from(new Set(slugs.flatMap((slug) => conflictMap[slug] ?? [])));

  if (conflicts.length === 0) {
    return "TRUE";
  }

  return conflicts
    .map((keyword) => {
      params.push(`%${keyword}%`);
      const index = params.length;
      return `${nameColumn} NOT ILIKE $${index}`;
    })
    .join(" AND ");
}

function buildConsumableBrandKeywordConditions(
  brandSlug: string,
  nameColumn: string,
  tagsColumn: string,
  params: unknown[],
) {
  const keywordMap: Record<string, string[]> = {
    canon: ["canon"],
    ricoh: ["ricoh"],
    konica: ["konica", "minolta", "bizhub"],
  };
  const keywords = keywordMap[brandSlug] ?? [brandSlug];

  return keywords
    .map((keyword) => {
      params.push(`%${keyword}%`);
      const index = params.length;
      return `(${nameColumn} ILIKE $${index} OR ${tagsColumn} ILIKE $${index})`;
    })
    .join(" OR ");
}

async function getProductByIdWithExecutor(
  productId: number,
  executor: DbExecutor = pool,
  options: { allowedVisibilities?: ProductVisibility[] } = {},
) {
  const params: unknown[] = [productId];
  const where: string[] = [`p."id" = $1`];

  if (options.allowedVisibilities && options.allowedVisibilities.length > 0) {
    where.push(buildVisibilityCondition(`p."visibility"`, options.allowedVisibilities, params));
  }

  const result = await executor.query<ProductRow>(
    `
      SELECT
        p."id",
        p."name",
        p."description",
        p."url",
        p."price",
        p."dealerPrice",
        p."dealerNotes",
        p."visibility",
        p."status",
        p."isFeatured",
        p."featuredOrder",
        p."tags",
        p."categoryId" AS "categoryId",
        p."createdAt" AS "createdAt",
        p."updatedAt" AS "updatedAt",
        CASE
          WHEN c."id" IS NULL THEN NULL
          ELSE json_build_object(
            'id', c."id",
            'name', c."name",
            'slug', c."slug"
          )
        END AS "category",
        COALESCE(
          (
            SELECT json_agg(
              json_build_object(
                'id', pi."id",
                'productId', pi."productId",
                'url', pi."url",
                'key', pi."key",
                'isPrimary', pi."isPrimary",
                'order', pi."order",
                'createdAt', pi."createdAt"
              )
              ORDER BY pi."order" ASC, pi."isPrimary" DESC, pi."createdAt" ASC, pi."id" ASC
            )
            FROM "ProductImage" pi
            WHERE pi."productId" = p."id"
          ),
          '[]'::json
        ) AS "images"
      FROM "Product" p
      LEFT JOIN "Category" c
        ON c."id" = p."categoryId"
      WHERE ${where.join(" AND ")}
      LIMIT 1
    `,
    params,
  );

  const row = result.rows[0];
  return row ? mapProductRow(row) : null;
}

async function insertProductImages(
  executor: DbExecutor,
  productId: number,
  images: ProductInputImage[],
) {
  const normalizedImages = normalizeImages(images);

  if (normalizedImages.length === 0) {
    return;
  }

  const values: unknown[] = [];
  const placeholders = normalizedImages.map((image, index) => {
    const offset = index * 5;
    values.push(productId, image.url, image.key, image.isPrimary, index);
    return `($${offset + 1}, $${offset + 2}, $${offset + 3}, $${offset + 4}, $${offset + 5})`;
  });

  await executor.query(
    `
      INSERT INTO "ProductImage" ("productId", "url", "key", "isPrimary", "order")
      VALUES ${placeholders.join(", ")}
    `,
    values,
  );
}

export async function getProductById(
  productId: number,
  options: { allowedVisibilities?: ProductVisibility[]; excludeKonicaMinolta?: boolean } = {},
) {
  const product = await getProductByIdWithExecutor(productId, pool, options);
  if (product && options.excludeKonicaMinolta && isKonicaMinoltaProduct(product)) {
    return null;
  }
  return (await withCanonicalProductSlugs(product ? [product] : []))[0] ?? null;
}

function isProductAllowedByLookupOptions(
  product: ProductRecord,
  options: { allowedVisibilities?: ProductVisibility[]; status?: string; excludeKonicaMinolta?: boolean },
) {
  if (options.status && product.status !== options.status) return false;

  if (
    options.allowedVisibilities &&
    options.allowedVisibilities.length > 0 &&
    !options.allowedVisibilities.includes(product.visibility)
  ) {
    return false;
  }

  if (options.excludeKonicaMinolta && isKonicaMinoltaProduct(product)) return false;

  return true;
}

function productMatchesSlug(product: ProductRecord, normalizedSlug: string) {
  const baseSlug = slugifyProductName(product.name);
  const candidates = [
    product.slug,
    baseSlug,
    `${baseSlug}-${product.id}`,
  ];

  return candidates.some((candidate) => normalizeProductSlug(candidate) === normalizedSlug);
}

async function listProductsForSlugLookup() {
  const result = await query<ProductRow>(
    `
      SELECT
        p."id",
        p."name",
        p."description",
        p."url",
        p."price",
        p."dealerPrice",
        p."dealerNotes",
        p."visibility",
        p."status",
        p."isFeatured",
        p."featuredOrder",
        p."tags",
        p."categoryId" AS "categoryId",
        p."createdAt" AS "createdAt",
        p."updatedAt" AS "updatedAt",
        CASE
          WHEN c."id" IS NULL THEN NULL
          ELSE json_build_object(
            'id', c."id",
            'name', c."name",
            'slug', c."slug"
          )
        END AS "category",
        COALESCE(
          (
            SELECT json_agg(
              json_build_object(
                'id', pi."id",
                'productId', pi."productId",
                'url', pi."url",
                'key', pi."key",
                'isPrimary', pi."isPrimary",
                'order', pi."order",
                'createdAt', pi."createdAt"
              )
              ORDER BY pi."order" ASC, pi."isPrimary" DESC, pi."createdAt" ASC, pi."id" ASC
            )
            FROM "ProductImage" pi
            WHERE pi."productId" = p."id"
          ),
          '[]'::json
        ) AS "images"
      FROM "Product" p
      LEFT JOIN "Category" c
        ON c."id" = p."categoryId"
      ORDER BY p."createdAt" DESC
    `,
  );

  return assignCanonicalProductSlugs(result.rows.map(mapProductRow));
}

export async function getProductBySlug(
  productSlug: string,
  options: { allowedVisibilities?: ProductVisibility[]; status?: string; excludeKonicaMinolta?: boolean } = {},
) {
  const normalizedSlug = normalizeProductSlug(productSlug);
  if (!normalizedSlug) return null;

  const products = await listProductsForSlugLookup();
  const match = products.find(
    (product) =>
      productMatchesSlug(product, normalizedSlug) &&
      isProductAllowedByLookupOptions(product, options),
  );

  if (!match) return null;

  return match;
}

function assignCanonicalProductSlugs<T extends { id: number; name: string }>(products: T[]) {
  const slugCounts = new Map<string, number>();

  for (const product of products) {
    const baseSlug = slugifyProductName(product.name);
    slugCounts.set(baseSlug, (slugCounts.get(baseSlug) ?? 0) + 1);
  }

  return products.map((product) => {
    const baseSlug = slugifyProductName(product.name);
    return {
      ...product,
      slug: (slugCounts.get(baseSlug) ?? 0) > 1 ? `${baseSlug}-${product.id}` : baseSlug,
    };
  });
}

async function withCanonicalProductSlugs<T extends ProductRecord>(
  products: T[],
) {
  if (products.length === 0) return products;

  const canonicalSlugs = await getCanonicalProductSlugMap();

  return products.map((product) => ({
    ...product,
    slug: canonicalSlugs.get(product.id) ?? slugifyProductName(product.name),
  }));
}

async function getCanonicalProductSlugMap() {
  const result = await query<{ id: number; name: string }>(
    `
      SELECT "id", "name"
      FROM "Product"
    `,
  );

  return new Map(
    assignCanonicalProductSlugs(result.rows).map((product) => [product.id, product.slug]),
  );
}

export async function listProducts(filters: ProductListFilters): Promise<ProductListResult> {
  const baseParams: unknown[] = [];
  const whereClause = buildProductWhereClause(filters, baseParams);

  const [{ rows: dataRows }, { rows: countRows }] = await Promise.all([
    query<ProductRow>(
      `
        SELECT
          p."id",
          p."name",
          p."description",
          p."url",
          p."price",
          p."dealerPrice",
          p."dealerNotes",
          p."visibility",
          p."status",
          p."isFeatured",
          p."featuredOrder",
          p."tags",
          p."categoryId" AS "categoryId",
          p."createdAt" AS "createdAt",
          p."updatedAt" AS "updatedAt",
          CASE
            WHEN c."id" IS NULL THEN NULL
            ELSE json_build_object(
              'id', c."id",
              'name', c."name",
              'slug', c."slug"
            )
          END AS "category",
          COALESCE(
            (
              SELECT json_agg(
                json_build_object(
                  'id', pi."id",
                  'productId', pi."productId",
                  'url', pi."url",
                  'key', pi."key",
                  'isPrimary', pi."isPrimary",
                  'order', pi."order",
                  'createdAt', pi."createdAt"
                )
                ORDER BY pi."order" ASC, pi."isPrimary" DESC, pi."createdAt" ASC, pi."id" ASC
              )
              FROM "ProductImage" pi
              WHERE pi."productId" = p."id"
            ),
            '[]'::json
          ) AS "images"
        FROM "Product" p
        LEFT JOIN "Category" c
          ON c."id" = p."categoryId"
        ${whereClause}
        ORDER BY ${
          filters.isFeatured
            ? `COALESCE(p."featuredOrder", 999999) ASC, p."createdAt" DESC`
            : `p."createdAt" DESC`
        }
        LIMIT $${baseParams.length + 1}
        OFFSET $${baseParams.length + 2}
      `,
      [...baseParams, filters.limit, (filters.page - 1) * filters.limit],
    ),
    query<{ total: number }>(
      `
        SELECT COUNT(*)::int AS "total"
        FROM "Product" p
        LEFT JOIN "Category" c
          ON c."id" = p."categoryId"
        ${whereClause}
      `,
      baseParams,
    ),
  ]);

  const data = dataRows.map(mapProductRow);

  return {
    data: await withCanonicalProductSlugs(data),
    total: countRows[0]?.total ?? 0,
  };
}

export async function createProduct(input: CreateProductInput) {
  return withTransaction(async (client) => {
    const productResult = await client.query<{ id: number }>(
      `
        INSERT INTO "Product" (
          "name",
          "description",
          "url",
          "price",
          "dealerPrice",
          "dealerNotes",
          "visibility",
          "status",
          "isFeatured",
          "tags",
          "categoryId",
          "updatedAt"
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW())
        RETURNING "id"
      `,
      [
        input.name,
        input.description ?? null,
        input.url ?? null,
        input.price ?? null,
        input.dealerPrice ?? null,
        input.dealerNotes ?? null,
        input.visibility ?? "public",
        input.status,
        input.isFeatured ?? false,
        input.tags ?? null,
        input.categoryId ?? null,
      ],
    );

    const productId = productResult.rows[0]?.id;
    if (!productId) {
      throw new Error("Failed to create product");
    }

    await insertProductImages(client, productId, input.images);
    return getProductByIdWithExecutor(productId, client);
  });
}

export async function updateProduct(productId: number, input: UpdateProductInput) {
  return withTransaction(async (client) => {
    const existingProduct = await client.query<{ id: number }>(
      `SELECT "id" FROM "Product" WHERE "id" = $1 LIMIT 1`,
      [productId],
    );

    if (existingProduct.rows.length === 0) {
      return null;
    }

    const currentImagesResult = await client.query<{
      id: number;
      url: string;
      key: string;
      isPrimary: boolean;
      order: number;
      createdAt: Date;
    }>(
      `
        SELECT "id", "url", "key", "isPrimary", "order", "createdAt" AS "createdAt"
        FROM "ProductImage"
        WHERE "productId" = $1
        ORDER BY "order" ASC, "isPrimary" DESC, "createdAt" ASC, "id" ASC
      `,
      [productId],
    );

    const currentImages = currentImagesResult.rows;
    const imageKeysToDelete: string[] = [];
    const updateClauses: string[] = [];
    const updateValues: unknown[] = [productId];

    const assignField = (column: string, value: unknown) => {
      updateValues.push(value);
      updateClauses.push(`"${column}" = $${updateValues.length}`);
    };

    if (input.name !== undefined) assignField("name", input.name);
    if (input.description !== undefined) assignField("description", input.description ?? null);
    if (input.url !== undefined) assignField("url", input.url ?? null);
    if (input.price !== undefined) assignField("price", input.price ?? null);
    if (input.dealerPrice !== undefined) assignField("dealerPrice", input.dealerPrice ?? null);
    if (input.dealerNotes !== undefined) assignField("dealerNotes", input.dealerNotes ?? null);
    if (input.visibility !== undefined) assignField("visibility", input.visibility);
    if (input.status !== undefined) assignField("status", input.status);
    if (input.isFeatured !== undefined) {
      assignField("isFeatured", input.isFeatured);
      if (!input.isFeatured) assignField("featuredOrder", null);
    }
    if (input.tags !== undefined) assignField("tags", input.tags ?? null);
    if (input.categoryId !== undefined) assignField("categoryId", input.categoryId ?? null);

    updateClauses.push(`"updatedAt" = NOW()`);

    await client.query(
      `
        UPDATE "Product"
        SET ${updateClauses.join(", ")}
        WHERE "id" = $1
      `,
      updateValues,
    );

    let nextImages: ProductInputImage[] | null = null;

    if (input.images !== undefined) {
      const normalizedImages = normalizeImages(input.images);
      const nextKeys = new Set(normalizedImages.map((image) => image.key));

      imageKeysToDelete.push(
        ...currentImages
          .filter((image) => !nextKeys.has(image.key))
          .map((image) => image.key),
      );

      nextImages = normalizedImages;
    } else if (input.editedImages !== undefined || (input.newImages?.length ?? 0) > 0) {
      const hasNewPrimary = input.newImages?.some((image) => image.isPrimary) ?? false;
      const currentImagesById = new Map(
        currentImages.map((image) => [image.id, image] as const),
      );

      const keptExistingImages =
        input.editedImages !== undefined
          ? normalizeImages(
              input.editedImages,
              hasNewPrimary ? Number.POSITIVE_INFINITY : 0,
            ).map((image) => {
              const currentImage = currentImagesById.get(image.id);
              if (!currentImage) {
                throw new Error(`Invalid product image id: ${image.id}`);
              }

              return {
                url: currentImage.url,
                key: currentImage.key,
                isPrimary: hasNewPrimary ? false : image.isPrimary ?? false,
              };
            })
          : currentImages.map((image) => ({
              url: image.url,
              key: image.key,
              isPrimary: hasNewPrimary ? false : image.isPrimary,
            }));

      if (input.editedImages !== undefined) {
        const keepIds = new Set(input.editedImages.map((image) => image.id));
        imageKeysToDelete.push(
          ...currentImages
            .filter((image) => !keepIds.has(image.id))
            .map((image) => image.key),
        );
      }

      nextImages = normalizeImages([
        ...keptExistingImages,
        ...(input.newImages ?? []),
      ]);
    }

    if (nextImages !== null) {
      // ProductImage has no explicit sort column, so we rebuild the rows in the
      // requested order to make drag-and-drop persistent across saves.
      await client.query(`DELETE FROM "ProductImage" WHERE "productId" = $1`, [productId]);
      await insertProductImages(client, productId, nextImages);
    }

    const product = await getProductByIdWithExecutor(productId, client);
    return {
      product,
      imageKeysToDelete,
    };
  });
}

export async function updateProductFeaturedStatus(
  productId: number,
  input: { isFeatured: boolean; featuredOrder?: number | null },
) {
  const result = await query<ProductRow>(
    `
      UPDATE "Product"
      SET
        "isFeatured" = $2,
        "featuredOrder" = $3,
        "updatedAt" = NOW()
      WHERE "id" = $1
      RETURNING
        "id",
        "name",
        "description",
        "url",
        "price",
        "dealerPrice",
        "dealerNotes",
        "visibility",
        "status",
        "isFeatured",
        "featuredOrder",
        "tags",
        "categoryId" AS "categoryId",
        "createdAt" AS "createdAt",
        "updatedAt" AS "updatedAt",
        NULL::json AS "category",
        '[]'::json AS "images"
    `,
    [productId, input.isFeatured, input.isFeatured ? input.featuredOrder ?? null : null],
  );

  return result.rows[0] ? mapProductRow(result.rows[0]) : null;
}

export async function deleteProduct(productId: number) {
  return withTransaction(async (client) => {
    const existingProduct = await client.query<{ id: number }>(
      `SELECT "id" FROM "Product" WHERE "id" = $1 LIMIT 1`,
      [productId],
    );

    if (existingProduct.rows.length === 0) {
      return null;
    }

    const imageResult = await client.query<{ key: string }>(
      `SELECT "key" FROM "ProductImage" WHERE "productId" = $1`,
      [productId],
    );

    await client.query(`DELETE FROM "ProductImage" WHERE "productId" = $1`, [productId]);
    await client.query(`DELETE FROM "Product" WHERE "id" = $1`, [productId]);

    return {
      imageKeys: imageResult.rows.map((image) => image.key),
    };
  });
}

export async function listCategories() {
  const result = await query<{
    id: number;
    name: string;
    slug: string;
    createdAt: Date;
    updatedAt: Date;
    productCount: number;
  }>(
    `
      SELECT
        c."id",
        c."name",
        c."slug",
        c."createdAt" AS "createdAt",
        c."updatedAt" AS "updatedAt",
        COUNT(p."id")::int AS "productCount"
      FROM "Category" c
      LEFT JOIN "Product" p
        ON p."categoryId" = c."id"
      GROUP BY c."id", c."name", c."slug", c."createdAt", c."updatedAt"
      ORDER BY c."name" ASC
    `,
  );

  return result.rows.map((row) => ({
    id: row.id,
    name: row.name,
    slug: row.slug,
    createdAt: new Date(row.createdAt),
    updatedAt: new Date(row.updatedAt),
    _count: {
      products: row.productCount,
    },
  })) satisfies CategoryRecord[];
}

export async function createCategory(name: string, slug: string) {
  const result = await query<CategorySummary>(
    `
      INSERT INTO "Category" ("name", "slug", "updatedAt")
      VALUES ($1, $2, NOW())
      RETURNING "id", "name", "slug"
    `,
    [name, slug],
  );

  return result.rows[0] ?? null;
}

export async function seedDefaultCategories() {
  const defaults = PRODUCT_CATEGORY_SEEDS;

  await query(
    `
      UPDATE "Category"
      SET
        "name" = 'Consumables',
        "slug" = 'consumables',
        "updatedAt" = NOW()
      WHERE "slug" = 'parts-and-toner'
        AND NOT EXISTS (
          SELECT 1 FROM "Category" existing WHERE existing."slug" = 'consumables'
        )
    `,
  );

  for (const category of defaults) {
    await query(
      `
        INSERT INTO "Category" ("name", "slug", "updatedAt")
        VALUES ($1, $2, NOW())
        ON CONFLICT ("slug")
        DO UPDATE SET
          "name" = EXCLUDED."name",
          "updatedAt" = NOW()
      `,
      [category.name, category.slug],
    );
  }
}

export async function getDashboardOverview(): Promise<DashboardOverview> {
  try {
    const countsResult = await query<{
      totalProducts: number;
      activeProducts: number;
      draftProducts: number;
      archivedProducts: number;
      totalCategories: number;
    }>(`
      SELECT
        COUNT(*)::int AS "totalProducts",
        COUNT(*) FILTER (WHERE "status" = 'active')::int AS "activeProducts",
        COUNT(*) FILTER (WHERE "status" = 'draft')::int AS "draftProducts",
        COUNT(*) FILTER (WHERE "status" = 'archived')::int AS "archivedProducts",
        (SELECT COUNT(*)::int FROM "Category") AS "totalCategories"
      FROM "Product"
    `);

    const recentProductsResult = await query<ProductRow>(`
      SELECT
        p."id",
        p."name",
        p."description",
        p."url",
        p."price",
        p."dealerPrice",
        p."dealerNotes",
        p."visibility",
        p."status",
        p."isFeatured",
        p."featuredOrder",
        p."tags",
        p."categoryId" AS "categoryId",
        p."createdAt" AS "createdAt",
        p."updatedAt" AS "updatedAt",
        CASE
          WHEN c."id" IS NULL THEN NULL
          ELSE json_build_object(
            'id', c."id",
            'name', c."name",
            'slug', c."slug"
          )
        END AS "category",
        COALESCE(
          (
            SELECT json_agg(
              json_build_object(
                'id', pi."id",
                'productId', pi."productId",
                'url', pi."url",
                'key', pi."key",
                'isPrimary', pi."isPrimary",
                'order', pi."order",
                'createdAt', pi."createdAt"
              )
              ORDER BY pi."order" ASC, pi."isPrimary" DESC, pi."createdAt" ASC, pi."id" ASC
            )
            FROM "ProductImage" pi
            WHERE pi."productId" = p."id"
          ),
          '[]'::json
        ) AS "images"
      FROM "Product" p
      LEFT JOIN "Category" c
        ON c."id" = p."categoryId"
      ORDER BY p."updatedAt" DESC
      LIMIT 4
    `);

    const counts = countsResult.rows[0] ?? {
      totalProducts: 0,
      activeProducts: 0,
      draftProducts: 0,
      archivedProducts: 0,
      totalCategories: 0,
    };

    return {
      totalProducts: counts.totalProducts,
      activeProducts: counts.activeProducts,
      draftProducts: counts.draftProducts,
      archivedProducts: counts.archivedProducts,
      totalCategories: counts.totalCategories,
      recentProducts: recentProductsResult.rows.map(mapProductRow),
    };
  } catch (error) {
    console.warn("[catalog-store] Failed to load dashboard overview", error);
    return {
      totalProducts: 0,
      activeProducts: 0,
      draftProducts: 0,
      archivedProducts: 0,
      totalCategories: 0,
      recentProducts: [],
    };
  }
}

export async function getDashboardNotificationSummary(): Promise<DashboardNotificationSummary> {
  const countsResult = await query<{
      totalProducts: number;
      draftProducts: number;
      uncategorizedCount: number;
      productsWithoutImagesCount: number;
    }>(
      `
        SELECT
          COUNT(*)::int AS "totalProducts",
          COUNT(*) FILTER (WHERE "status" = 'draft')::int AS "draftProducts",
          COUNT(*) FILTER (WHERE "categoryId" IS NULL)::int AS "uncategorizedCount",
          COUNT(*) FILTER (
            WHERE NOT EXISTS (
              SELECT 1
              FROM "ProductImage" pi
              WHERE pi."productId" = p."id"
            )
          )::int AS "productsWithoutImagesCount"
        FROM "Product" p
      `,
    );

  const uncategorizedProductsResult = await query<DashboardIssueProduct>(
    `
      SELECT
        "id",
        "name",
        "updatedAt" AS "updatedAt"
      FROM "Product"
      WHERE "categoryId" IS NULL
      ORDER BY "updatedAt" DESC, "id" DESC
      LIMIT 3
    `,
  );

  const productsWithoutImagesResult = await query<DashboardIssueProduct>(
    `
      SELECT
        p."id",
        p."name",
        p."updatedAt" AS "updatedAt"
      FROM "Product" p
      WHERE NOT EXISTS (
        SELECT 1
        FROM "ProductImage" pi
        WHERE pi."productId" = p."id"
      )
      ORDER BY p."updatedAt" DESC, p."id" DESC
      LIMIT 3
    `,
  );

  return {
    totalProducts: countsResult.rows[0]?.totalProducts ?? 0,
    draftProducts: countsResult.rows[0]?.draftProducts ?? 0,
    uncategorizedProducts: uncategorizedProductsResult.rows,
    uncategorizedCount: countsResult.rows[0]?.uncategorizedCount ?? 0,
    productsWithoutImages: productsWithoutImagesResult.rows,
    productsWithoutImagesCount:
      countsResult.rows[0]?.productsWithoutImagesCount ?? 0,
  };
}

export async function listProductImagesForMigration(options: {
  productId?: number;
  limit?: number;
}) {
  const params: unknown[] = [];
  const conditions: string[] = [];

  if (typeof options.productId === "number") {
    params.push(options.productId);
    conditions.push(`"productId" = $${params.length}`);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  if (typeof options.limit === "number") {
    params.push(options.limit);
  }

  const result = await query<ProductImageMigrationRow>(
    `
      SELECT
        "id",
        "productId" AS "productId",
        "url",
        "key"
      FROM "ProductImage"
      ${whereClause}
      ORDER BY "id" ASC
      ${typeof options.limit === "number" ? `LIMIT $${params.length}` : ""}
    `,
    params,
  );

  return result.rows;
}

export async function updateProductImageKey(imageId: number, key: string) {
  await query(
    `UPDATE "ProductImage" SET "key" = $1 WHERE "id" = $2`,
    [key, imageId],
  );
}

export async function updateProductImageStorageLink(
  imageId: number,
  payload: { key: string; url: string },
) {
  await query(
    `UPDATE "ProductImage" SET "key" = $1, "url" = $2 WHERE "id" = $3`,
    [payload.key, payload.url, imageId],
  );
}
