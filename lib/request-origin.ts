import "server-only";

export function resolveRequestOrigin(request: Request) {
  const configured = (process.env.NEXT_PUBLIC_SITE_URL ?? "").trim().replace(/\/+$/, "");

  if (configured) {
    return configured;
  }

  const forwardedHost = request.headers.get("x-forwarded-host");
  const host = forwardedHost || request.headers.get("host");

  if (host) {
    const proto = request.headers.get("x-forwarded-proto") || "https";
    return `${proto}://${host}`;
  }

  return new URL(request.url).origin;
}
