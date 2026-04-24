import type { Pool, PoolClient } from "pg";
import { pool, query, withTransaction } from "@/lib/db";

type DbExecutor = Pick<Pool, "query"> | PoolClient;

export type ProductStatus = "draft" | "active" | "archived";

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
  createdAt: Date;
}

export interface ProductRecord {
  id: number;
  name: string;
  description: string | null;
  url: string | null;
  price: number | null;
  status: string;
  tags: string | null;
  categoryId: number | null;
  createdAt: Date;
  updatedAt: Date;
  images: ProductImageRecord[];
  category: CategorySummary | null;
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
  search?: string;
  categoryId?: number;
  slug?: string;
}

export interface CreateProductInput {
  name: string;
  description?: string | null;
  url?: string | null;
  price?: number | null;
  status: ProductStatus;
  tags?: string | null;
  categoryId?: number | null;
  images: ProductInputImage[];
}

export interface UpdateProductInput {
  name?: string;
  description?: string | null;
  url?: string | null;
  price?: number | null;
  status?: string;
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
  status: string;
  tags: string | null;
  categoryId: number | null;
  createdAt: Date;
  updatedAt: Date;
  category: CategorySummary | null;
  images: ProductImageRecord[] | null;
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
    name: row.name,
    description: row.description,
    url: row.url,
    price: row.price == null ? null : Number(row.price),
    status: row.status,
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

  if (typeof filters.categoryId === "number") {
    params.push(filters.categoryId);
    conditions.push(`p."categoryId" = $${params.length}`);
  }

  if (filters.slug) {
    params.push(filters.slug);
    conditions.push(`c."slug" = $${params.length}`);
  }

  if (filters.search) {
    params.push(`%${filters.search}%`);
    const tokenIndex = params.length;
    conditions.push(
      `(p."name" ILIKE $${tokenIndex} OR p."description" ILIKE $${tokenIndex} OR p."tags" ILIKE $${tokenIndex})`,
    );
  }

  if (conditions.length === 0) {
    return "";
  }

  return `WHERE ${conditions.join(" AND ")}`;
}

async function getProductByIdWithExecutor(
  productId: number,
  executor: DbExecutor = pool,
) {
  const result = await executor.query<ProductRow>(
    `
      SELECT
        p."id",
        p."name",
        p."description",
        p."url",
        p."price",
        p."status",
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
                'createdAt', pi."createdAt"
              )
              ORDER BY pi."isPrimary" DESC, pi."createdAt" ASC, pi."id" ASC
            )
            FROM "ProductImage" pi
            WHERE pi."productId" = p."id"
          ),
          '[]'::json
        ) AS "images"
      FROM "Product" p
      LEFT JOIN "Category" c
        ON c."id" = p."categoryId"
      WHERE p."id" = $1
      LIMIT 1
    `,
    [productId],
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
    const offset = index * 4;
    values.push(productId, image.url, image.key, image.isPrimary);
    return `($${offset + 1}, $${offset + 2}, $${offset + 3}, $${offset + 4})`;
  });

  await executor.query(
    `
      INSERT INTO "ProductImage" ("productId", "url", "key", "isPrimary")
      VALUES ${placeholders.join(", ")}
    `,
    values,
  );
}

export async function getProductById(productId: number) {
  return getProductByIdWithExecutor(productId, pool);
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
          p."status",
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
                  'createdAt', pi."createdAt"
                )
                ORDER BY pi."isPrimary" DESC, pi."createdAt" ASC, pi."id" ASC
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
        ORDER BY p."createdAt" DESC
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

  return {
    data: dataRows.map(mapProductRow),
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
          "status",
          "tags",
          "categoryId",
          "updatedAt"
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
        RETURNING "id"
      `,
      [
        input.name,
        input.description ?? null,
        input.url ?? null,
        input.price ?? null,
        input.status,
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
      createdAt: Date;
    }>(
      `
        SELECT "id", "url", "key", "isPrimary", "createdAt" AS "createdAt"
        FROM "ProductImage"
        WHERE "productId" = $1
        ORDER BY "isPrimary" DESC, "createdAt" ASC, "id" ASC
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
    if (input.status !== undefined) assignField("status", input.status);
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
  const defaults = [
    { name: "Photocopiers", slug: "photocopiers" },
    { name: "Consumables", slug: "consumables" },
  ];

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
    const [countsResult, categoriesCountResult, recentProductsResult] = await Promise.all([
      query<{
        totalProducts: number;
        activeProducts: number;
        draftProducts: number;
        archivedProducts: number;
      }>(
        `
          SELECT
            COUNT(*)::int AS "totalProducts",
            COUNT(*) FILTER (WHERE "status" = 'active')::int AS "activeProducts",
            COUNT(*) FILTER (WHERE "status" = 'draft')::int AS "draftProducts",
            COUNT(*) FILTER (WHERE "status" = 'archived')::int AS "archivedProducts"
          FROM "Product"
        `,
      ),
      query<{ totalCategories: number }>(
        `SELECT COUNT(*)::int AS "totalCategories" FROM "Category"`,
      ),
      query<ProductRow>(
        `
          SELECT
            p."id",
            p."name",
            p."description",
            p."url",
            p."price",
            p."status",
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
                    'createdAt', pi."createdAt"
                  )
                  ORDER BY pi."isPrimary" DESC, pi."createdAt" ASC, pi."id" ASC
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
        `,
      ),
    ]);

    const counts = countsResult.rows[0] ?? {
      totalProducts: 0,
      activeProducts: 0,
      draftProducts: 0,
      archivedProducts: 0,
    };

    return {
      totalProducts: counts.totalProducts,
      activeProducts: counts.activeProducts,
      draftProducts: counts.draftProducts,
      archivedProducts: counts.archivedProducts,
      totalCategories: categoriesCountResult.rows[0]?.totalCategories ?? 0,
      recentProducts: recentProductsResult.rows.map(mapProductRow),
    };
  } catch (error) {
    console.error("[catalog-store] Failed to load dashboard overview", error);
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
  const [
    countsResult,
    uncategorizedCountResult,
    uncategorizedProductsResult,
    productsWithoutImagesCountResult,
    productsWithoutImagesResult,
  ] = await Promise.all([
    query<{
      totalProducts: number;
      draftProducts: number;
    }>(
      `
        SELECT
          COUNT(*)::int AS "totalProducts",
          COUNT(*) FILTER (WHERE "status" = 'draft')::int AS "draftProducts"
        FROM "Product"
      `,
    ),
    query<{ uncategorizedCount: number }>(
      `
        SELECT COUNT(*)::int AS "uncategorizedCount"
        FROM "Product"
        WHERE "categoryId" IS NULL
      `,
    ),
    query<DashboardIssueProduct>(
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
    ),
    query<{ productsWithoutImagesCount: number }>(
      `
        SELECT COUNT(*)::int AS "productsWithoutImagesCount"
        FROM "Product" p
        WHERE NOT EXISTS (
          SELECT 1
          FROM "ProductImage" pi
          WHERE pi."productId" = p."id"
        )
      `,
    ),
    query<DashboardIssueProduct>(
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
    ),
  ]);

  return {
    totalProducts: countsResult.rows[0]?.totalProducts ?? 0,
    draftProducts: countsResult.rows[0]?.draftProducts ?? 0,
    uncategorizedProducts: uncategorizedProductsResult.rows,
    uncategorizedCount: uncategorizedCountResult.rows[0]?.uncategorizedCount ?? 0,
    productsWithoutImages: productsWithoutImagesResult.rows,
    productsWithoutImagesCount:
      productsWithoutImagesCountResult.rows[0]?.productsWithoutImagesCount ?? 0,
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
