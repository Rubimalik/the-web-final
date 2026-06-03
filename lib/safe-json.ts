type JsonRecord = Record<string, unknown>;

function previewRawBody(raw: string) {
  const compact = raw.replace(/\s+/g, " ").trim();
  return compact.length > 400 ? `${compact.slice(0, 400)}...` : compact;
}

export async function safeReadJsonResponse<T = JsonRecord>(
  response: Response,
  context: string
): Promise<T | null> {
  const contentType = response.headers.get("content-type") ?? "";
  let raw = "";
  try {
    raw = await response.text();
  } catch (error) {
    console.error(`[${context}] Failed to read response body`, error);
    return null;
  }

  if (!raw.trim()) {
    return null;
  }

  if (!contentType.toLowerCase().includes("application/json")) {
    return null;
  }

  try {
    return JSON.parse(raw) as T;
  } catch (error) {
    console.error(`[${context}] Invalid JSON response`, error, { raw });
    return null;
  }
}

export async function safeReadRequestJson<T = JsonRecord>(
  request: Request,
  context: string
): Promise<T | null> {
  let raw = "";
  try {
    raw = await request.text();
  } catch (error) {
    console.error(`[${context}] Failed to read request body`, error);
    return null;
  }

  console.debug(`[${context}] Request body`, { raw: previewRawBody(raw) });

  if (!raw.trim()) {
    return null;
  }

  try {
    return JSON.parse(raw) as T;
  } catch (error) {
    console.error(`[${context}] Invalid JSON request body`, error, { raw });
    return null;
  }
}

export function readJsonArrayField<T>(
  payload: unknown,
  fieldNames: string[] = ["data", "products"],
) {
  if (Array.isArray(payload)) {
    return payload as T[];
  }

  if (!payload || typeof payload !== "object") {
    return [];
  }

  const record = payload as Record<string, unknown>;
  for (const fieldName of fieldNames) {
    if (Array.isArray(record[fieldName])) {
      return record[fieldName] as T[];
    }
  }

  return [];
}
