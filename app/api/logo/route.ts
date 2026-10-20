import { normalizeDomain } from "@/lib/companies";

const DAY = 60 * 60 * 24;
const SIZES = new Set([16, 32, 64, 128]);

// 204 instead of 404 so a missing logo does not log a console error in the browser.
const noLogo = () =>
  new Response(null, {
    status: 204,
    headers: { "Cache-Control": `public, max-age=${DAY}` },
  });

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const domain = normalizeDomain(searchParams.get("domain") ?? "");
  const requested = Number(searchParams.get("sz"));
  const size = SIZES.has(requested) ? requested : 64;
  if (!domain) return noLogo();

  let upstream: Response;
  try {
    upstream = await fetch(
      `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=${size}`,
      { signal: AbortSignal.timeout(5000) },
    );
  } catch {
    return noLogo();
  }

  const type = upstream.headers.get("content-type") ?? "";
  if (!upstream.ok || !type.startsWith("image/")) return noLogo();

  return new Response(upstream.body, {
    headers: {
      "Content-Type": type,
      "Cache-Control": `public, max-age=${7 * DAY}, stale-while-revalidate=${30 * DAY}`,
    },
  });
}
