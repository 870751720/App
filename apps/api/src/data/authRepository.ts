import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import type { PrismaClient, UserRole } from "@prisma/client";
import { demoAccounts } from "@app/domain";
import type { LoginRequest, UserAccountResponse } from "@app/schemas";

const scrypt = promisify(scryptCallback);
const keyLength = 64;

export interface AuthRepository {
  authenticate(input: LoginRequest): Promise<UserAccountResponse | null>;
  findByEmail(email: string): Promise<UserAccountResponse | null>;
}

export function createPrismaAuthRepository(prisma: PrismaClient): AuthRepository {
  async function findByEmail(email: string) {
    await seedInitialAccounts(prisma);
    const user = await prisma.user.findUnique({ where: { email } });
    return user ? toPublicUser(user) : null;
  }

  async function authenticate(input: LoginRequest) {
    await seedInitialAccounts(prisma);
    const user = await prisma.user.findUnique({ where: { email: input.email } });

    if (!user || !user.passwordHash || !(await verifyPassword(input.password, user.passwordHash))) {
      return null;
    }

    return toPublicUser(user);
  }

  return { authenticate, findByEmail };
}

export async function hashPassword(password: string, salt = randomBytes(16).toString("hex")) {
  const derivedKey = (await scrypt(password, salt, keyLength)) as Buffer;
  return `scrypt:${salt}:${derivedKey.toString("hex")}`;
}

export async function verifyPassword(password: string, storedHash: string) {
  const [algorithm, salt, expectedKey] = storedHash.split(":");
  if (algorithm !== "scrypt" || !salt || !expectedKey) {
    return false;
  }

  const actualKey = (await scrypt(password, salt, keyLength)) as Buffer;
  const expected = Buffer.from(expectedKey, "hex");
  return actualKey.byteLength === expected.byteLength && timingSafeEqual(actualKey, expected);
}

async function seedInitialAccounts(prisma: PrismaClient) {
  for (const account of demoAccounts) {
    await prisma.user.upsert({
      where: { email: account.email },
      create: {
        email: account.email,
        name: account.name,
        title: account.title,
        role: toDbUserRole(account.role),
        passwordHash: await hashPassword(account.password)
      },
      update: {
        name: account.name,
        title: account.title,
        role: toDbUserRole(account.role),
        passwordHash: await hashPassword(account.password)
      }
    });
  }
}

function toPublicUser(user: { id: number; email: string; name: string; title: string; role: UserRole }): UserAccountResponse {
  return {
    id: String(user.id),
    email: user.email,
    name: user.name,
    title: user.title,
    role: fromDbUserRole(user.role)
  };
}

function toDbUserRole(role: UserAccountResponse["role"]): UserRole {
  const map: Record<UserAccountResponse["role"], UserRole> = {
    owner: "OWNER",
    admin: "ADMIN",
    user: "USER"
  };
  return map[role];
}

function fromDbUserRole(role: UserRole): UserAccountResponse["role"] {
  const map: Record<UserRole, UserAccountResponse["role"]> = {
    OWNER: "owner",
    ADMIN: "admin",
    USER: "user"
  };
  return map[role];
}
