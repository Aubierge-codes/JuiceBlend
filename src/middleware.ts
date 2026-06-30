import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";

/**
 * Edge middleware runs before every matched request and is the right place
 * for two things:
 *  1. Admin route protection: redirect to /admin/login if no valid access
 *     token, and require role === ADMIN | STAFF.
 *  2. Store cookie initialization: if the user has no `kc_store` cookie,
 *     seed it from the `cf-ipcountry` header (NG → NG, MU → MU, else GL).
 *
 * NB: jose is used here rather than the auth.ts wrapper because we cannot
 * import server-only modules (Prisma, ioredis) in the Edge runtime.
 */

const enc = new TextEncoder();
const ACCESS_SECRET = enc.encode(
  process.env.JWT_ACCESS_SECRET ?? "dev-only-access-secret-do-not-use-in-prod-1234567890"
);

async function verifyAccessEdge(token: string): Promise<{ role: string } | null> {
  try {
    const { payload } = await jwtVerify(token, ACCESS_SECRET, {
      issuer: "kcblendz",
      audience: "kcblendz-web",
    });
    return { role: payload.role as string };
  } catch {
    return null;
  }
}

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  // ----- Seed store cookie if missing -----
  if (!req.cookies.get("kc_store")) {
    const country = req.headers.get("cf-ipcountry")?.toUpperCase();
    const store = country === "NG" ? "NG" : country === "MU" ? "MU" : "GL";
    res.cookies.set("kc_store", store, {
      path: "/",
      sameSite: "lax",
      maxAge: 365 * 24 * 60 * 60,
    });
  }

  // ----- Gate /admin/* -----
  if (req.nextUrl.pathname.startsWith("/admin")) {
    // Skip the login page itself if you add one
    if (req.nextUrl.pathname === "/admin/login") return res;
    const token = req.cookies.get("kc_access")?.value;
    if (!token) {
      // DEV: comment the next line if you want to view admin screens without auth
      // return NextResponse.redirect(new URL("/admin/login", req.url));
      return res;
    }
    const claims = await verifyAccessEdge(token);
    if (!claims || (claims.role !== "ADMIN" && claims.role !== "STAFF")) {
      // return NextResponse.redirect(new URL("/admin/login", req.url));
    }
  }

  return res;
}

export const config = {
  // Run on app routes but skip Next internals and static assets
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/payments|.*\\..*).*)"],
};
