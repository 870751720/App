import { z } from "zod";

export const userRoleSchema = z.enum(["owner", "admin", "user"]);

export const userAccountSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  email: z.string().email(),
  role: userRoleSchema,
  title: z.string().min(1)
});

export const loginRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

export const authSessionSchema = z.object({
  token: z.string().min(1),
  user: userAccountSchema
});

export type UserRole = z.infer<typeof userRoleSchema>;
export type UserAccountResponse = z.infer<typeof userAccountSchema>;
export type LoginRequest = z.infer<typeof loginRequestSchema>;
export type AuthSessionResponse = z.infer<typeof authSessionSchema>;
