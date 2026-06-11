import type { FastifyInstance, FastifyRequest } from "fastify";
import { authSessionSchema, loginRequestSchema, userAccountSchema } from "@app/schemas";
import type { AuthRepository } from "../data/authRepository.js";
import { createSessionToken, verifySessionToken } from "./sessionToken.js";

export function resolveSessionUser(request: FastifyRequest, jwtSecret: string) {
  const authorization = request.headers.authorization;

  if (!authorization?.startsWith("Bearer ")) {
    return null;
  }

  return verifySessionToken(authorization.slice("Bearer ".length), jwtSecret);
}

export interface RegisterAuthRoutesOptions {
  authRepository: AuthRepository;
  jwtSecret: string;
}

export async function registerAuthRoutes(app: FastifyInstance, { authRepository, jwtSecret }: RegisterAuthRoutesOptions) {
  app.post("/auth/login", async (request, reply) => {
    const credential = loginRequestSchema.parse(request.body);
    const account = await authRepository.authenticate(credential);

    if (!account) {
      return reply.code(401).send({
        message: "Invalid email or password"
      });
    }

    return authSessionSchema.parse({
      token: createSessionToken(account, jwtSecret),
      user: account
    });
  });

  app.get("/auth/me", async (request, reply) => {
    const user = resolveSessionUser(request, jwtSecret);

    if (!user) {
      return reply.code(401).send({
        message: "Authentication required"
      });
    }

    return userAccountSchema.parse(user);
  });
}
