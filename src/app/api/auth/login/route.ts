import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { signAccessToken, signRefreshToken, verifyMfaCode } from "@/lib/auth";
import { rateLimit, rateLimitKey, limits } from "@/lib/rate-limit";
import { audit } from "@/lib/audit";

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  mfaCode: z.string().regex(/^\d{6}$/).optional(),
});

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_MINUTES = 30;

export async function POST(req: Request) {
  // Rate-limit per IP — proposal §3.7: 5 attempts per 15 minutes
  const ip = rateLimitKey(req);
  const rl = await rateLimit(limits.login, ip);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Too many login attempts. Please try again later." },
      { status: 429 }
    );
  }

  // Parse + validate
  const parse = LoginSchema.safeParse(await req.json().catch(() => ({})));
  if (!parse.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  const { email, password, mfaCode } = parse.data;

  // Lookup user (constant-time-ish — always run bcrypt)
  const user = await prisma.user.findUnique({ where: { email } });
  // Dummy hash used when the user doesn't exist — keeps timing similar so
  // attackers can't enumerate emails by response latency.
  const dummyHash = "$2a$12$1234567890123456789012uX5gV6sQk1xKpYx0eR9P0G3uG3uG3a";
  const ok = await bcrypt.compare(password, user?.passwordHash ?? dummyHash);

  if (!user || !ok || user.deletedAt) {
    if (user) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          failedLoginCount: { increment: 1 },
          lockedUntil:
            user.failedLoginCount + 1 >= MAX_FAILED_ATTEMPTS
              ? new Date(Date.now() + LOCKOUT_MINUTES * 60_000)
              : undefined,
        },
      });
    }
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  // Lockout check
  if (user.lockedUntil && user.lockedUntil > new Date()) {
    return NextResponse.json({ error: "Account locked. Try later." }, { status: 423 });
  }

  // MFA — required for ADMIN/STAFF
  let mfaPassed = !user.mfaEnabled;
  if (user.mfaEnabled) {
    if (!mfaCode) {
      // First step succeeded; client needs to prompt for MFA
      return NextResponse.json({ mfaRequired: true });
    }
    if (!user.mfaSecret || !verifyMfaCode(user.mfaSecret, mfaCode)) {
      return NextResponse.json({ error: "Invalid MFA code" }, { status: 401 });
    }
    mfaPassed = true;
  }

  // Issue tokens
  const access = await signAccessToken({
    sub: user.id,
    role: user.role,
    store: user.preferredStore,
    mfaPassed,
  });
  const { token: refresh, jti } = await signRefreshToken(user.id);
  const refreshHash = await bcrypt.hash(refresh, 10);

  // Persist session row (refresh hashed at rest — never stored plain)
  await prisma.session.create({
    data: {
      id: jti,
      userId: user.id,
      refreshTokenHash: refreshHash,
      userAgent: req.headers.get("user-agent") ?? undefined,
      ip,
      expiresAt: new Date(Date.now() + Number(process.env.JWT_REFRESH_TTL_SEC ?? 2_592_000) * 1000),
    },
  });

  await prisma.user.update({
    where: { id: user.id },
    data: { failedLoginCount: 0, lockedUntil: null, lastLoginAt: new Date() },
  });

  await audit({
    actorId: user.id,
    action: "LOGIN_SUCCESS",
    entity: "users",
    entityId: user.id,
    ip,
    userAgent: req.headers.get("user-agent") ?? undefined,
  });

  const response = NextResponse.json({
    user: { id: user.id, email: user.email, role: user.role, fullName: user.fullName },
  });
  response.cookies.set("kc_access", access, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: Number(process.env.JWT_ACCESS_TTL_SEC ?? 86400),
    path: "/",
  });
  response.cookies.set("kc_refresh", refresh, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: Number(process.env.JWT_REFRESH_TTL_SEC ?? 2_592_000),
    path: "/",
  });
  return response;
}
