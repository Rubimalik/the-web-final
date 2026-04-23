import { readdir, writeFile } from "node:fs/promises";
import path from "node:path";

const projectRoot = process.cwd();
const functionRoot = path.join(
  projectRoot,
  ".netlify",
  "functions-internal",
  "___netlify-server-handler",
);

async function findFirstFile(startDir, predicate) {
  const entries = await readdir(startDir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(startDir, entry.name);

    if (entry.isDirectory()) {
      const nested = await findFirstFile(fullPath, predicate);

      if (nested) {
        return nested;
      }

      continue;
    }

    if (predicate(fullPath)) {
      return fullPath;
    }
  }

  return null;
}

function dirnameN(input, steps) {
  let current = input;

  for (let index = 0; index < steps; index += 1) {
    current = path.dirname(current);
  }

  return current;
}

const serverRuntimePath = await findFirstFile(functionRoot, (filePath) =>
  filePath.endsWith(path.join(".netlify", "dist", "run", "handlers", "server.js")),
);

if (!serverRuntimePath) {
  throw new Error("Could not locate the generated Next.js runtime handler under .netlify/functions-internal.");
}

const appRoot = dirnameN(serverRuntimePath, 5);
const appRelativePath = path.relative(functionRoot, appRoot).split(path.sep).join("/");
const targetPath = path.join(functionRoot, "___netlify-server-handler.mjs");

const shimSource = `import { Buffer } from "node:buffer";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const FUNCTION_ROOT = path.dirname(fileURLToPath(import.meta.url));
const APP_ROOT = path.join(FUNCTION_ROOT, ${JSON.stringify(appRelativePath)});
const runtimeRequire = createRequire(import.meta.url);
const LOCAL_STORE_KEY = Symbol.for("netlify.manual.local.store");

let cachedModules;

function getLocalStoreCache() {
  if (!globalThis[LOCAL_STORE_KEY]) {
    globalThis[LOCAL_STORE_KEY] = new Map();
  }

  return globalThis[LOCAL_STORE_KEY];
}

function createLocalStore() {
  const cache = getLocalStoreCache();

  return {
    async get(key) {
      return cache.has(key) ? cache.get(key).value : null;
    },
    async set(key, value) {
      const updatedAt = Date.now();

      cache.set(key, {
        updatedAt,
        value,
      });

      return {
        etag: String(updatedAt),
      };
    },
  };
}

function installStorageFallback() {
  const storageModulePath = runtimeRequire.resolve(
    path.join(APP_ROOT, ".netlify/dist/run/storage/storage.cjs"),
  );
  const originalStorageModule = runtimeRequire(storageModulePath);
  const cachedStorageModule = runtimeRequire.cache[storageModulePath];

  if (cachedStorageModule?.exports?.__manualStoreFallbackInstalled) {
    return;
  }

  const patchedStorageModule = {
    ...originalStorageModule,
    __manualStoreFallbackInstalled: true,
    getMemoizedKeyValueStoreBackedByRegionalBlobStore: () => createLocalStore(),
  };

  if (!cachedStorageModule) {
    throw new Error("Could not locate storage.cjs in the CommonJS module cache.");
  }

  cachedStorageModule.exports = patchedStorageModule;
}

async function loadModules() {
  if (cachedModules) {
    return cachedModules;
  }

  const requestContextModule = await import(
    pathToFileURL(path.join(APP_ROOT, ".netlify/dist/run/handlers/request-context.cjs")).href,
  );
  const tracerModule = await import(
    pathToFileURL(path.join(APP_ROOT, ".netlify/dist/run/handlers/tracer.cjs")).href,
  );

  installStorageFallback();

  const serverModule = await import(
    pathToFileURL(path.join(APP_ROOT, ".netlify/dist/run/handlers/server.js")).href,
  );

  cachedModules = {
    createRequestContext: requestContextModule.createRequestContext,
    getTracer: tracerModule.getTracer,
    nextServerHandler: serverModule.default,
    runWithRequestContext: requestContextModule.runWithRequestContext,
    withActiveSpan: tracerModule.withActiveSpan,
  };

  return cachedModules;
}

function getHeader(headers, key) {
  if (!headers) {
    return undefined;
  }

  return headers[key] ?? headers[key.toLowerCase()] ?? headers[key.toUpperCase()];
}

function buildUrl(event) {
  if (event.rawUrl) {
    return event.rawUrl;
  }

  const protocol = getHeader(event.headers, "x-forwarded-proto") ?? "https";
  const host =
    getHeader(event.headers, "x-forwarded-host") ??
    getHeader(event.headers, "host") ??
    process.env.URL?.replace(/^https?:\\/\\//, "") ??
    "localhost";
  const url = new URL(event.path ?? "/", \`\${protocol}://\${host}\`);

  const multiValueQuery = event.multiValueQueryStringParameters ?? {};

  for (const [key, values] of Object.entries(multiValueQuery)) {
    if (Array.isArray(values)) {
      for (const value of values) {
        if (typeof value !== "undefined") {
          url.searchParams.append(key, String(value));
        }
      }
    }
  }

  const singleValueQuery = event.queryStringParameters ?? {};

  for (const [key, value] of Object.entries(singleValueQuery)) {
    if (!url.searchParams.has(key) && typeof value !== "undefined" && value !== null) {
      url.searchParams.append(key, String(value));
    }
  }

  return url.toString();
}

function buildHeaders(eventHeaders) {
  const headers = new Headers();

  for (const [key, value] of Object.entries(eventHeaders ?? {})) {
    if (typeof value !== "undefined" && value !== null) {
      headers.set(key, String(value));
    }
  }

  return headers;
}

function buildBody(event) {
  if (typeof event.body !== "string" || event.body.length === 0) {
    return undefined;
  }

  return event.isBase64Encoded ? Buffer.from(event.body, "base64") : event.body;
}

function buildRequest(event) {
  const method = event.httpMethod ?? "GET";
  const headers = buildHeaders(event.headers);
  const body = method === "GET" || method === "HEAD" ? undefined : buildBody(event);

  return new Request(buildUrl(event), {
    body,
    duplex: body ? "half" : undefined,
    headers,
    method,
  });
}

function buildContext(event, lambdaContext) {
  return {
    account: { id: process.env.ACCOUNT_ID ?? "" },
    deploy: { id: process.env.DEPLOY_ID ?? "" },
    params: event.pathParameters ?? {},
    requestId:
      getHeader(event.headers, "x-nf-request-id") ??
      lambdaContext?.awsRequestId ??
      "",
    site: {
      id: process.env.SITE_ID ?? "",
      name: process.env.SITE_NAME ?? "",
      url: process.env.URL ?? "",
    },
    waitUntil: () => {},
  };
}

function isTextResponse(contentType) {
  if (!contentType) {
    return true;
  }

  return (
    contentType.startsWith("text/") ||
    contentType.includes("application/json") ||
    contentType.includes("application/javascript") ||
    contentType.includes("application/xml") ||
    contentType.includes("application/xhtml+xml") ||
    contentType.includes("application/x-www-form-urlencoded") ||
    contentType.includes("image/svg+xml")
  );
}

async function toLambdaResponse(response) {
  const headers = {};

  for (const [key, value] of response.headers.entries()) {
    if (key.toLowerCase() !== "set-cookie") {
      headers[key] = value;
    }
  }

  const multiValueHeaders = {};
  const setCookies =
    typeof response.headers.getSetCookie === "function" ? response.headers.getSetCookie() : [];

  if (setCookies.length > 0) {
    multiValueHeaders["set-cookie"] = setCookies;
  }

  if (response.body === null) {
    return {
      body: "",
      headers,
      multiValueHeaders,
      statusCode: response.status,
    };
  }

  const bodyBuffer = Buffer.from(await response.arrayBuffer());
  const contentType = response.headers.get("content-type") ?? "";
  const isBinary = !isTextResponse(contentType);

  return {
    body: isBinary ? bodyBuffer.toString("base64") : bodyBuffer.toString("utf8"),
    headers,
    isBase64Encoded: isBinary,
    multiValueHeaders,
    statusCode: response.status,
  };
}

process.env.USE_REGIONAL_BLOBS = "true";
process.chdir(APP_ROOT);

export async function handler(event, context) {
  const req = buildRequest(event);
  const nextContext = buildContext(event, context);
  const {
    createRequestContext,
    getTracer,
    nextServerHandler,
    runWithRequestContext,
    withActiveSpan,
  } = await loadModules();
  const requestContext = createRequestContext(req, nextContext);
  const tracer = getTracer();

  const handlerResponse = await runWithRequestContext(requestContext, () =>
    withActiveSpan(tracer, "Next.js Server Handler", async (span) => {
      span?.setAttributes?.({
        "account.id": nextContext.account.id,
        "deploy.id": nextContext.deploy.id,
        "http.method": req.method,
        "http.target": req.url,
        "request.id": nextContext.requestId,
        "site.id": nextContext.site.id,
        cwd: APP_ROOT,
        isBackgroundRevalidation: requestContext.isBackgroundRevalidation,
        monorepo: true,
      });

      const response = await nextServerHandler(req, nextContext, span, requestContext);

      span?.setAttributes?.({
        "http.status_code": response.status,
      });

      return response;
    }),
  );

  if (requestContext.serverTiming) {
    handlerResponse.headers.set("server-timing", requestContext.serverTiming);
  }

  return toLambdaResponse(handlerResponse);
}

export const config = {
  path: "/*",
  preferStatic: true,
};
`;

await writeFile(targetPath, shimSource, "utf8");

console.log(`Patched Netlify manual handler: ${targetPath}`);
