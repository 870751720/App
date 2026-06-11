import { createHmac, timingSafeEqual } from "node:crypto";
import { userAccountSchema, type UserAccountResponse } from "@app/schemas";

const sessionTtlMs = 7 * 24 * 60 * 60 * 1000;

interface SessionPayload {
  user: UserAccountResponse;
  iat: number;
  exp: number;
}

export function createSessionToken(user: UserAccountResponse, secret: string, now = Date.now()) {
  const payload = Buffer.from(JSON.stringify({ user, iat: now, exp: now + sessionTtlMs } satisfies SessionPayload), "utf8").toString("base64url");
  const signature = signPayload(payload, secret);
  return `${payload}.${signature}`;
}

export function verifySessionToken(token: string, secret: string, now = Date.now()): UserAccountResponse | null {
  const [payload, signature] = token.split(".");
  if (!payload || !signature) {
    return null;
  }

  const expectedSignature = signPayload(payload, secret);
  const actual = Buffer.from(signature);
  const expected = Buffer.from(expectedSignature);
  if (actual.byteLength !== expected.byteLength || !timingSafeEqual(actual, expected)) {
    return null;
  }

  try {
    const parsed = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as Partial<SessionPayload>;
    if (typeof parsed.exp !== "number" || parsed.exp <= now) {
      return null;
    }

    return userAccountSchema.parse(parsed.user);
  } catch {
    return null;
  }
}

function signPayload(payload: string, secret: string) {
  return createHmac("sha256", secret).update(payload).digest("base64url");
}
