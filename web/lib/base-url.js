import { headers } from "next/headers";

export function getServerBaseUrl() {
  const h = headers();
  const host = h.get("host");
  if (!host) return "";
  const proto =
    h.get("x-forwarded-proto") || (process.env.VERCEL ? "https" : "http");
  return `${proto}://${host}`;
}
