import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import * as OTPAuth from "otpauth";
import QRCode from "qrcode";

/**
 * Auth primitives.
 *
 * Security choices documented per the proposal §3.7:
 *   - bcrypt 12 rounds for password hashing
 *   - JWT signed with HS256 using a 256-bit secret
 *   - Access token TTL: 24h (proposal); refresh token TTL: 30d
 *   - Refresh tokens are rotated on use and stored hashed in DB
 *   - MFA uses TOTP (RFC 6238) with a 30-second window — Google Authenticator
 *     compatible.
 *
 * Token claims:
 *   { sub: userId, role, store, iat, exp, jti }
 */

const enc = new TextEncoder();
const ACCESS_SECRET = enc.encode(
  process.env.JWT_ACCESS_SECRET ?? "dev-only-access-secret-do-not-use-in-prod-1234567890"
);
const REFRESH_SECRET = enc.encode(
  process.env.JWT_REFRESH_SECRET ?? "dev-only-refresh-secret-do-not-use-in-prod-0987654321"
);

const ACCESS_TTL = Number(process.env.JWT_ACCESS_TTL_SEC ?? 86400);
const REFRESH_TTL = Number(process.env.JWT_REFRESH_TTL_SEC ?? 2_592_000);
const BCRYPT_ROUNDS = Number(process.env.BCRYPT_ROUNDS ?? 12);

export type JwtRole = "CUSTOMER" | "ADMIN" | "STAFF";
export interface AccessClaims {
  sub: string;
  role: JwtRole;
  store: "NG" | "MU" | "GL";
  mfaPassed?: boolean;
  jti: string;
  iat: number;
  exp: number;
}

// ---- Password hashing -----------------------------------------------------

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, BCRYPT_ROUNDS);
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

// ---- JWT ------------------------------------------------------------------

function randomJti() {
  // 16 bytes of randomness → 22-char base64url
  return crypto.randomUUID().replace(/-/g, "");
}

export async function signAccessToken(payload: Omit<AccessClaims, "jti" | "iat" | "exp">): Promise<string> {
  const jti = randomJti();
  return new SignJWT({ ...payload, jti })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setIssuedAt()
    .setExpirationTime(`${ACCESS_TTL}s`)
    .setIssuer("kcblendz")
    .setAudience("kcblendz-web")
    .sign(ACCESS_SECRET);
}

export async function signRefreshToken(sub: string): Promise<{ token: string; jti: string }> {
  const jti = randomJti();
  const token = await new SignJWT({ sub, jti })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setIssuedAt()
    .setExpirationTime(`${REFRESH_TTL}s`)
    .setIssuer("kcblendz")
    .setAudience("kcblendz-refresh")
    .sign(REFRESH_SECRET);
  return { token, jti };
}

export async function verifyAccess(token: string): Promise<AccessClaims | null> {
  try {
    const { payload } = await jwtVerify(token, ACCESS_SECRET, {
      issuer: "kcblendz",
      audience: "kcblendz-web",
    });
    return payload as unknown as AccessClaims;
  } catch {
    return null;
  }
}

export async function verifyRefresh(token: string): Promise<{ sub: string; jti: string } | null> {
  try {
    const { payload } = await jwtVerify(token, REFRESH_SECRET, {
      issuer: "kcblendz",
      audience: "kcblendz-refresh",
    });
    return { sub: payload.sub as string, jti: payload.jti as string };
  } catch {
    return null;
  }
}

// ---- MFA ------------------------------------------------------------------

export interface MfaSetup {
  secret: string;
  qrDataUrl: string;
  uri: string;
}

export async function generateMfaSetup(email: string): Promise<MfaSetup> {
  const secret = new OTPAuth.Secret({ size: 20 });
  const totp = new OTPAuth.TOTP({
    issuer: process.env.MFA_ISSUER ?? "KcBlendz",
    label: email,
    algorithm: "SHA1",
    digits: 6,
    period: 30,
    secret,
  });
  const uri = totp.toString();
  const qrDataUrl = await QRCode.toDataURL(uri, { margin: 1, scale: 5 });
  return { secret: secret.base32, qrDataUrl, uri };
}

export function verifyMfaCode(secretBase32: string, code: string): boolean {
  const totp = new OTPAuth.TOTP({
    issuer: process.env.MFA_ISSUER ?? "KcBlendz",
    label: "user",
    algorithm: "SHA1",
    digits: 6,
    period: 30,
    secret: OTPAuth.Secret.fromBase32(secretBase32),
  });
  // window: ±1 → tolerate 30s clock drift in either direction
  const delta = totp.validate({ token: code, window: 1 });
  return delta !== null;
}
