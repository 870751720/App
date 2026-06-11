import assert from "node:assert/strict";
import test from "node:test";
import { hashPassword, verifyPassword } from "./authRepository.js";

test("verifyPassword accepts the original password", async () => {
  const hash = await hashPassword("user123", "fixed-salt");

  assert.equal(await verifyPassword("user123", hash), true);
});

test("verifyPassword rejects a wrong password", async () => {
  const hash = await hashPassword("user123", "fixed-salt");

  assert.equal(await verifyPassword("wrong", hash), false);
});
