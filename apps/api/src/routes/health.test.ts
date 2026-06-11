import assert from "node:assert/strict";
import test from "node:test";
import Fastify from "fastify";
import { registerHealthRoutes } from "./health.js";

test("health route includes dependency checks", async () => {
  const app = Fastify();
  await registerHealthRoutes(app, {
    healthCheck: async () => ({ database: "ok" })
  });

  const response = await app.inject({ method: "GET", url: "/health" });
  const payload = response.json() as { checks?: Record<string, string> };

  assert.equal(response.statusCode, 200);
  assert.equal(payload.checks?.database, "ok");
});
