import { pool, query, withTransaction } from "@/lib/db";
import type { Pool, PoolClient } from "pg";

type DbExecutor = Pick<Pool, "query"> | PoolClient;

export type OrderStatus = "pending" | "confirmed" | "paid" | "fulfilled" | "cancelled";
export type PaymentStatus = "unpaid" | "pending" | "paid" | "failed" | "refunded";

export type OrderItemInput = {
  productId?: number | null;
  productName: string;
  unitPrice?: number | null;
  quantity: number;
  metadata?: Record<string, unknown> | null;
};

export type CreateOrderInput = {
  userId?: string | null;
  customerName?: string | null;
  customerEmail?: string | null;
  customerPhone?: string | null;
  notes?: string | null;
  adminNotes?: string | null;
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  paymentProvider?: string | null;
  paymentMethod?: string | null;
  paymentSessionId?: string | null;
  stripeSessionId?: string | null;
  stripePaymentIntentId?: string | null;
  amountTotal?: number | null;
  currency?: string;
  source?: string;
  metadata?: Record<string, unknown> | null;
  items: OrderItemInput[];
};

export type OrderItemRecord = {
  id: string;
  orderId: string;
  productId: number | null;
  productName: string;
  unitPrice: number | null;
  quantity: number;
  lineTotal: number | null;
  metadata: Record<string, unknown> | null;
  createdAt: Date;
};

export type OrderRecord = {
  id: string;
  userId: string | null;
  customerName: string | null;
  customerEmail: string | null;
  customerPhone: string | null;
  notes: string | null;
  adminNotes: string | null;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentProvider: string | null;
  paymentMethod: string | null;
  paymentSessionId: string | null;
  stripeSessionId: string | null;
  stripePaymentIntentId: string | null;
  amountTotal: number | null;
  currency: string;
  source: string;
  metadata: Record<string, unknown> | null;
  createdAt: Date;
  updatedAt: Date;
  items: OrderItemRecord[];
};

type OrderRow = Omit<OrderRecord, "items"> & {
  items: OrderItemRecord[] | null;
};

export type OrderListResult = {
  data: OrderRecord[];
  total: number;
};

export type OrderListFilters = {
  page: number;
  limit: number;
  status?: string;
  paymentStatus?: string;
  search?: string;
};

export type OrderStats = {
  totalOrders: number;
  pendingOrders: number;
  paidOrders: number;
  fulfilledOrders: number;
};

const ORDER_STATUSES = new Set<OrderStatus>([
  "pending",
  "confirmed",
  "paid",
  "fulfilled",
  "cancelled",
]);

const PAYMENT_STATUSES = new Set<PaymentStatus>([
  "unpaid",
  "pending",
  "paid",
  "failed",
  "refunded",
]);

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function toOrderStatus(value: unknown): OrderStatus {
  return typeof value === "string" && ORDER_STATUSES.has(value as OrderStatus)
    ? (value as OrderStatus)
    : "pending";
}

function toPaymentStatus(value: unknown): PaymentStatus {
  return typeof value === "string" && PAYMENT_STATUSES.has(value as PaymentStatus)
    ? (value as PaymentStatus)
    : "unpaid";
}

function normalizeMoney(value: unknown) {
  const numberValue = typeof value === "number" ? value : Number(value);
  return Number.isFinite(numberValue) && numberValue >= 0 ? numberValue : null;
}

function mapOrderRow(row: OrderRow): OrderRecord {
  return {
    id: row.id,
    userId: row.userId,
    customerName: row.customerName,
    customerEmail: row.customerEmail,
    customerPhone: row.customerPhone,
    notes: row.notes,
    adminNotes: row.adminNotes,
    status: toOrderStatus(row.status),
    paymentStatus: toPaymentStatus(row.paymentStatus),
    paymentProvider: row.paymentProvider,
    paymentMethod: row.paymentMethod,
    paymentSessionId: row.paymentSessionId,
    stripeSessionId: row.stripeSessionId,
    stripePaymentIntentId: row.stripePaymentIntentId,
    amountTotal: row.amountTotal == null ? null : Number(row.amountTotal),
    currency: row.currency,
    source: row.source,
    metadata: row.metadata,
    createdAt: new Date(row.createdAt),
    updatedAt: new Date(row.updatedAt),
    items: Array.isArray(row.items)
      ? row.items.map((item) => ({
          id: item.id,
          orderId: item.orderId,
          productId: item.productId == null ? null : Number(item.productId),
          productName: item.productName,
          unitPrice: item.unitPrice == null ? null : Number(item.unitPrice),
          quantity: Number(item.quantity),
          lineTotal: item.lineTotal == null ? null : Number(item.lineTotal),
          metadata: item.metadata,
          createdAt: new Date(item.createdAt),
        }))
      : [],
  };
}

function orderSelectSql(whereClause: string) {
  return `
    SELECT
      o."id",
      o."userId" AS "userId",
      o."customerName" AS "customerName",
      o."customerEmail" AS "customerEmail",
      o."customerPhone" AS "customerPhone",
      o."notes",
      o."adminNotes" AS "adminNotes",
      o."status",
      o."paymentStatus" AS "paymentStatus",
      o."paymentProvider" AS "paymentProvider",
      to_jsonb(o)->>'paymentMethod' AS "paymentMethod",
      o."paymentSessionId" AS "paymentSessionId",
      to_jsonb(o)->>'stripeSessionId' AS "stripeSessionId",
      to_jsonb(o)->>'stripePaymentIntentId' AS "stripePaymentIntentId",
      o."amountTotal" AS "amountTotal",
      o."currency",
      o."source",
      o."metadata",
      o."createdAt" AS "createdAt",
      o."updatedAt" AS "updatedAt",
      COALESCE(
        (
          SELECT json_agg(
            json_build_object(
              'id', oi."id",
              'orderId', oi."orderId",
              'productId', oi."productId",
              'productName', oi."productName",
              'unitPrice', oi."unitPrice",
              'quantity', oi."quantity",
              'lineTotal', oi."lineTotal",
              'metadata', oi."metadata",
              'createdAt', oi."createdAt"
            )
            ORDER BY oi."createdAt" ASC, oi."id" ASC
          )
          FROM "OrderItem" oi
          WHERE oi."orderId" = o."id"
        ),
        '[]'::json
      ) AS "items"
    FROM "Order" o
    ${whereClause}
  `;
}

function buildOrderWhereClause(
  filters: Omit<OrderListFilters, "page" | "limit">,
  params: unknown[],
) {
  const conditions: string[] = [];

  if (filters.status && ORDER_STATUSES.has(filters.status as OrderStatus)) {
    params.push(filters.status);
    conditions.push(`o."status" = $${params.length}`);
  }

  if (
    filters.paymentStatus &&
    PAYMENT_STATUSES.has(filters.paymentStatus as PaymentStatus)
  ) {
    params.push(filters.paymentStatus);
    conditions.push(`o."paymentStatus" = $${params.length}`);
  }

  if (filters.search) {
    params.push(`%${filters.search}%`);
    const index = params.length;
    conditions.push(
      `(o."id"::text ILIKE $${index} OR o."customerName" ILIKE $${index} OR o."customerEmail" ILIKE $${index})`,
    );
  }

  return conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
}

async function getOrderByIdWithExecutor(
  orderId: string,
  executor: DbExecutor = pool,
) {
  const result = await executor.query<OrderRow>(
    `${orderSelectSql(`WHERE o."id" = $1`)} LIMIT 1`,
    [orderId],
  );

  const row = result.rows[0];
  return row ? mapOrderRow(row) : null;
}

export async function getOrderById(orderId: string) {
  if (!UUID_RE.test(orderId)) return null;
  return getOrderByIdWithExecutor(orderId);
}

export async function listOrders(filters: OrderListFilters): Promise<OrderListResult> {
  const baseParams: unknown[] = [];
  const whereClause = buildOrderWhereClause(filters, baseParams);

  const [{ rows: dataRows }, { rows: countRows }] = await Promise.all([
    query<OrderRow>(
      `
        ${orderSelectSql(whereClause)}
        ORDER BY o."createdAt" DESC
        LIMIT $${baseParams.length + 1}
        OFFSET $${baseParams.length + 2}
      `,
      [...baseParams, filters.limit, (filters.page - 1) * filters.limit],
    ),
    query<{ total: number }>(
      `
        SELECT COUNT(*)::int AS "total"
        FROM "Order" o
        ${whereClause}
      `,
      baseParams,
    ),
  ]);

  return {
    data: dataRows.map(mapOrderRow),
    total: countRows[0]?.total ?? 0,
  };
}

export async function listDealerOrders(
  userId: string,
  filters: Pick<OrderListFilters, "page" | "limit" | "status">,
): Promise<OrderListResult> {
  const params: unknown[] = [userId, "dealer"];
  const conditions = [`o."userId" = $1`, `o."source" = $2`];

  if (filters.status && ORDER_STATUSES.has(filters.status as OrderStatus)) {
    params.push(filters.status);
    conditions.push(`o."status" = $${params.length}`);
  }

  const whereClause = `WHERE ${conditions.join(" AND ")}`;
  const dataResult = await query<OrderRow>(
    `
      ${orderSelectSql(whereClause)}
      ORDER BY o."createdAt" DESC
      LIMIT $${params.length + 1}
      OFFSET $${params.length + 2}
    `,
    [...params, filters.limit, (filters.page - 1) * filters.limit],
  );

  const countResult = await query<{ total: number }>(
    `
      SELECT COUNT(*)::int AS "total"
      FROM "Order" o
      ${whereClause}
    `,
    params,
  );

  return {
    data: dataResult.rows.map(mapOrderRow),
    total: countResult.rows[0]?.total ?? 0,
  };
}

export async function listCustomerOrders(
  userId: string,
  filters: Pick<OrderListFilters, "page" | "limit" | "status">,
): Promise<OrderListResult> {
  const params: unknown[] = [userId, "checkout"];
  const conditions = [`o."userId" = $1`, `o."source" = $2`];

  if (filters.status && ORDER_STATUSES.has(filters.status as OrderStatus)) {
    params.push(filters.status);
    conditions.push(`o."status" = $${params.length}`);
  }

  const whereClause = `WHERE ${conditions.join(" AND ")}`;
  const dataResult = await query<OrderRow>(
    `
      ${orderSelectSql(whereClause)}
      ORDER BY o."createdAt" DESC
      LIMIT $${params.length + 1}
      OFFSET $${params.length + 2}
    `,
    [...params, filters.limit, (filters.page - 1) * filters.limit],
  );

  const countResult = await query<{ total: number }>(
    `
      SELECT COUNT(*)::int AS "total"
      FROM "Order" o
      ${whereClause}
    `,
    params,
  );

  return {
    data: dataResult.rows.map(mapOrderRow),
    total: countResult.rows[0]?.total ?? 0,
  };
}

export async function createOrder(input: CreateOrderInput) {
  const items = input.items
    .map((item) => {
      const productName = item.productName.trim();
      const quantity = Math.max(1, Math.floor(item.quantity));
      const unitPrice = normalizeMoney(item.unitPrice);
      const lineTotal = unitPrice == null ? null : Number((unitPrice * quantity).toFixed(2));

      return {
        productId: item.productId ?? null,
        productName,
        unitPrice,
        quantity,
        lineTotal,
        metadata: item.metadata ?? null,
      };
    })
    .filter((item) => item.productName);

  if (items.length === 0) {
    throw new Error("Order must include at least one item");
  }

  const calculatedAmount = items.reduce(
    (sum, item) => sum + (item.lineTotal ?? 0),
    0,
  );
  const amountTotal =
    input.amountTotal === undefined
      ? calculatedAmount
      : normalizeMoney(input.amountTotal);

  return withTransaction(async (client) => {
    const orderResult = await client.query<{ id: string }>(
      `
        INSERT INTO "Order" (
          "userId",
          "customerName",
          "customerEmail",
          "customerPhone",
          "notes",
          "adminNotes",
          "status",
          "paymentStatus",
          "paymentProvider",
          "paymentSessionId",
          "amountTotal",
          "currency",
          "source",
          "metadata",
          "updatedAt"
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW())
        RETURNING "id"
      `,
      [
        input.userId ?? null,
        input.customerName ?? null,
        input.customerEmail ?? null,
        input.customerPhone ?? null,
        input.notes ?? null,
        input.adminNotes ?? null,
        input.status ?? "pending",
        input.paymentStatus ?? "unpaid",
        input.paymentProvider ?? null,
        input.paymentSessionId ?? null,
        amountTotal,
        input.currency ?? "gbp",
        input.source ?? "checkout",
        input.metadata ? JSON.stringify(input.metadata) : null,
      ],
    );

    const orderId = orderResult.rows[0]?.id;
    if (!orderId) {
      throw new Error("Failed to create order");
    }

    const values: unknown[] = [];
    const placeholders = items.map((item, index) => {
      const offset = index * 7;
      values.push(
        orderId,
        item.productId,
        item.productName,
        item.unitPrice,
        item.quantity,
        item.lineTotal,
        item.metadata ? JSON.stringify(item.metadata) : null,
      );
      return `($${offset + 1}, $${offset + 2}, $${offset + 3}, $${offset + 4}, $${offset + 5}, $${offset + 6}, $${offset + 7})`;
    });

    await client.query(
      `
        INSERT INTO "OrderItem" (
          "orderId",
          "productId",
          "productName",
          "unitPrice",
          "quantity",
          "lineTotal",
          "metadata"
        )
        VALUES ${placeholders.join(", ")}
      `,
      values,
    );

    return getOrderByIdWithExecutor(orderId, client);
  });
}

export async function updateOrder(
  orderId: string,
  input: {
    status?: OrderStatus;
    paymentStatus?: PaymentStatus;
    adminNotes?: string | null;
  },
) {
  if (!UUID_RE.test(orderId)) return null;

  const values: unknown[] = [orderId];
  const clauses: string[] = [];

  const assign = (column: string, value: unknown) => {
    values.push(value);
    clauses.push(`"${column}" = $${values.length}`);
  };

  if (input.status) assign("status", input.status);
  if (input.paymentStatus) assign("paymentStatus", input.paymentStatus);
  if (input.adminNotes !== undefined) assign("adminNotes", input.adminNotes);

  if (clauses.length === 0) {
    return getOrderById(orderId);
  }

  await query(
    `
      UPDATE "Order"
      SET ${clauses.join(", ")}, "updatedAt" = NOW()
      WHERE "id" = $1
    `,
    values,
  );

  return getOrderById(orderId);
}

export async function markStripePaymentComplete(input: {
  orderId?: string | null;
  sessionId: string;
  paymentIntentId?: string | null;
  amountTotal: number;
  currency: string;
  customerEmail?: string | null;
}) {
  const amountTotal = Number((input.amountTotal / 100).toFixed(2));
  const params = [
    input.sessionId,
    input.paymentIntentId ?? null,
    amountTotal,
    input.currency || "gbp",
    input.customerEmail ?? null,
  ];

  if (input.orderId && UUID_RE.test(input.orderId)) {
    const result = await query(
      `
        UPDATE "Order"
        SET
          "status" = CASE
            WHEN "status" IN ('pending', 'confirmed') THEN 'paid'
            ELSE "status"
          END,
          "paymentStatus" = 'paid',
          "paymentProvider" = 'stripe',
          "paymentSessionId" = $1,
          "amountTotal" = $3,
          "currency" = $4,
          "customerEmail" = COALESCE("customerEmail", $5),
          "metadata" = COALESCE("metadata", '{}'::jsonb) || jsonb_strip_nulls(jsonb_build_object(
            'paymentMethod', 'card',
            'stripeSessionId', $1,
            'stripePaymentIntentId', $2
          )),
          "updatedAt" = NOW()
        WHERE "id" = $6
      `,
      [...params, input.orderId],
    );

    if ((result.rowCount ?? 0) > 0) return;
  }

  await query(
    `
      UPDATE "Order"
      SET
        "status" = CASE
          WHEN "status" IN ('pending', 'confirmed') THEN 'paid'
          ELSE "status"
        END,
        "paymentStatus" = 'paid',
        "paymentProvider" = 'stripe',
        "paymentSessionId" = $1,
        "amountTotal" = $3,
        "currency" = $4,
        "customerEmail" = COALESCE("customerEmail", $5),
        "metadata" = COALESCE("metadata", '{}'::jsonb) || jsonb_strip_nulls(jsonb_build_object(
          'paymentMethod', 'card',
          'stripeSessionId', $1,
          'stripePaymentIntentId', $2
        )),
        "updatedAt" = NOW()
      WHERE "paymentSessionId" = $1
    `,
    params,
  );
}

export async function attachStripeSessionToOrder(orderId: string, sessionId: string) {
  if (!UUID_RE.test(orderId)) return;

  await query(
    `
      UPDATE "Order"
      SET
        "paymentProvider" = 'stripe',
        "paymentSessionId" = $1,
        "paymentStatus" = CASE
          WHEN "paymentStatus" = 'unpaid' THEN 'pending'
          ELSE "paymentStatus"
        END,
        "metadata" = COALESCE("metadata", '{}'::jsonb) || jsonb_build_object(
          'paymentMethod', 'card',
          'stripeSessionId', $1
        ),
        "updatedAt" = NOW()
      WHERE "id" = $2
    `,
    [sessionId, orderId],
  );
}

export async function markStripePaymentFailed(input: {
  orderId?: string | null;
  sessionId: string;
}) {
  const params: unknown[] = [input.sessionId];
  const conditions = [`"paymentSessionId" = $1`];

  if (input.orderId && UUID_RE.test(input.orderId)) {
    params.push(input.orderId);
    conditions.push(`"id" = $${params.length}`);
  }

  await query(
    `
      UPDATE "Order"
      SET
        "status" = CASE
          WHEN "status" IN ('pending', 'confirmed') THEN 'cancelled'
          ELSE "status"
        END,
        "paymentStatus" = 'failed',
        "paymentProvider" = 'stripe',
        "metadata" = COALESCE("metadata", '{}'::jsonb) || jsonb_build_object(
          'paymentMethod', 'card',
          'stripeSessionId', $1
        ),
        "updatedAt" = NOW()
      WHERE ${conditions.map((condition) => `(${condition})`).join(" OR ")}
    `,
    params,
  );
}

export async function getOrderStats(): Promise<OrderStats> {
  const result = await query<OrderStats>(
    `
      SELECT
        COUNT(*)::int AS "totalOrders",
        COUNT(*) FILTER (WHERE "status" = 'pending')::int AS "pendingOrders",
        COUNT(*) FILTER (WHERE "paymentStatus" = 'paid')::int AS "paidOrders",
        COUNT(*) FILTER (WHERE "status" = 'fulfilled')::int AS "fulfilledOrders"
      FROM "Order"
    `,
  );

  return result.rows[0] ?? {
    totalOrders: 0,
    pendingOrders: 0,
    paidOrders: 0,
    fulfilledOrders: 0,
  };
}
