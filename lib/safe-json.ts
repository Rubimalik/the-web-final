type JsonRecord = Record<string, unknown>;

function previewRawBody(raw: string) {
  const compact = raw.replace(/\s+/g, " ").trim();
  return compact.length > 400 ? `${compact.slice(0, 400)}...` : compact;
}

export async function safeReadJsonResponse<T = JsonRecord>(
  response: Response,
  context: string
): Promise<T | null> {
  let raw = "";
  try {
    raw = await response.text();
  } catch (error) {
    console.error(`[${context}] Failed to read response body`, error);
    return null;
  }

  console.debug(`[${context}] Response body`, {
    status: response.status,
    ok: response.ok,
    raw: previewRawBody(raw),
  });

  if (!raw.trim()) {
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
