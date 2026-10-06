import { NextResponse, type NextRequest } from "next/server";
import { env } from "cloudflare:workers";
import {
  localIdentity,
  verifyAccessToken,
  type AuthConfig,
} from "./lib/server/auth";
import { HttpError } from "./lib/server/errors";
export async function proxy(request: NextRequest) {
  try {
    const config = env as unknown as AuthConfig;
    if (!localIdentity(request, config))
      await verifyAccessToken(
        request.headers.get("cf-access-jwt-assertion"),
        config,
      );
    const response = NextResponse.next();
    response.headers.set("Cache-Control", "private, no-store");
    response.headers.set("X-Content-Type-Options", "nosniff");
    response.headers.set("Referrer-Policy", "same-origin");
    response.headers.set("X-Frame-Options", "DENY");
    response.headers.set(
      "Permissions-Policy",
      "camera=(), microphone=(), geolocation=()",
    );
    response.headers.set(
      "Content-Security-Policy",
      "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'",
    );
    return response;
  } catch (error) {
    return new NextResponse(
      error instanceof HttpError ? error.message : "Authentication required",
      {
        status: error instanceof HttpError ? error.status : 401,
        headers: { "Cache-Control": "no-store" },
      },
    );
  }
}
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|assets/|favicon.ico|icon.svg|apple-icon.png).*)",
  ],
};
