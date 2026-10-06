import { timingSafeEqual } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";

function safeEqual(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}

function isAuthorized(header: string | null, user: string, password: string) {
  if (!header?.startsWith("Basic ")) return false;

  const decoded = Buffer.from(header.slice(6), "base64").toString();
  const separator = decoded.indexOf(":");
  if (separator === -1) return false;

  const userMatches = safeEqual(decoded.slice(0, separator), user);
  const passwordMatches = safeEqual(decoded.slice(separator + 1), password);
  return userMatches && passwordMatches;
}

export function proxy(request: NextRequest) {
  const user = process.env.BASIC_AUTH_USER;
  const password = process.env.BASIC_AUTH_PASSWORD;

  if (!user || !password) {
    if (process.env.NODE_ENV === "production") {
      return new NextResponse("Basic auth is not configured", { status: 503 });
    }
    return NextResponse.next();
  }

  if (isAuthorized(request.headers.get("authorization"), user, password)) {
    return NextResponse.next();
  }

  return new NextResponse("Authentication required", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="Sales CRM", charset="UTF-8"' },
  });
}

export const config = {
  matcher: "/((?!_next/static|robots.txt).*)",
};
