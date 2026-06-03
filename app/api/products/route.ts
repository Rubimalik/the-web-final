import { NextRequest } from "next/server";
import { GET as getProducts } from "@/app/api/product/route";

export function GET(req: NextRequest) {
  const url = new URL(req.url);
  url.pathname = "/api/product";

  if (!url.searchParams.has("public")) {
    url.searchParams.set("public", "1");
  }

  return getProducts(new NextRequest(url, { headers: req.headers }));
}
