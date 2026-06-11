import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import test from "node:test";
import { createSessionToken, verifySessionToken } from "./sessionToken.js";

const user = {
  id: "1",
  name: "复读学生",
  email: "user@app.local",
  role: "user" as const,
  title: "复读学生"
};

test("session token verifies with the same secret", () => {
  const token = createSessionToken(user, "test-secret-at-least-16", 1000);

  assert.deepEqual(verifySessionToken(token, "test-secret-at-least-16", 2000), user);
});

test("session token rejects a different secret", () => {
  const token = createSessionToken(user, "test-secret-at-least-16");

  assert.equal(verifySessionToken(token, "different-secret-at-least-16"), null);
});

test("session token rejects a tampered payload", () => {
  const token = createSessionToken(user, "test-secret-at-least-16");
  const [payload, signature] = token.split(".");
  const tamperedPayload = Buffer.from(JSON.stringify({ user: { ...user, role: "owner" }, iat: Date.now() }), "utf8").toString("base64url");

  assert.equal(verifySessionToken(`${tamperedPayload}.${signature ?? payload}`, "test-secret-at-least-16"), null);
});

test("session token rejects expired sessions", () => {
  const token = createSessionToken(user, "test-secret-at-least-16", 1000);

  assert.equal(verifySessionToken(token, "test-secret-at-least-16", 8 * 24 * 60 * 60 * 1000), null);
});

test("session token rejects invalid user payloads", () => {
  const payload = Buffer.from(JSON.stringify({ user: { ...user, email: "not-email" }, iat: 1000, exp: 999999999 }), "utf8").toString("base64url");
  const signature = createHmac("sha256", "test-secret-at-least-16").update(payload).digest("base64url");

  assert.equal(verifySessionToken(`${payload}.${signature}`, "test-secret-at-least-16", 2000), null);
});
