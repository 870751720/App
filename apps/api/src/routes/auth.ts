import type { FastifyInstance, FastifyRequest } from "fastify";
import { authenticateDemoAccount, demoAccounts, toPublicAccount } from "@app/domain";
import { authSessionSchema, loginRequestSchema, userAccountSchema } from "@app/schemas";

function createSessionToken(accountId: string) {
  const payload = JSON.stringify({
    sub: accountId,
    iat: Date.now()
  });

  return Buffer.from(payload, "utf8").toString("base64url");
}

export function resolveSessionUser(request: FastifyRequest) {
  const authorization = request.headers.authorization;

  if (!authorization?.startsWith("Bearer ")) {
    return null;
  }

  try {
    const payload = JSON.parse(Buffer.from(authorization.slice("Bearer ".length), "base64url").toString("utf8")) as {
      sub?: string;
    };

    const account = demoAccounts.find((candidate) => candidate.id === payload.sub);
    return account ? toPublicAccount(account) : null;
  } catch {
    return null;
  }
}

export async function registerAuthRoutes(app: FastifyInstance) {
  app.post("/auth/login", async (request, reply) => {
    const credential = loginRequestSchema.parse(request.body);
    const account = authenticateDemoAccount(credential);

    if (!account) {
      return reply.code(401).send({
        message: "Invalid email or password"
      });
    }

    return authSessionSchema.parse({
      token: createSessionToken(account.id),
      user: toPublicAccount(account)
    });
  });

  app.get("/auth/me", async (request, reply) => {
    const user = resolveSessionUser(request);

    if (!user) {
      return reply.code(401).send({
        message: "Authentication required"
      });
    }

    return userAccountSchema.parse(user);
  });
}
