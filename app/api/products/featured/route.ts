import { NextRequest } from "next/server";
import { GET as getProducts } from "@/app/api/product/route";

export function GET(req: NextRequest) {
  const url = new URL(req.url);
  url.pathname = "/api/product";
  url.searchParams.set("featured", "1");

  if (!url.searchParams.has("public")) {
    url.searchParams.set("public", "1");
  }

  if (!url.searchParams.has("page")) {
    url.searchParams.set("page", "1");
  }

  if (!url.searchParams.has("limit")) {
    url.searchParams.set("limit", "12");
  }

  return getProducts(new NextRequest(url, { headers: req.headers }));
}
