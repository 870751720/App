import { z } from "zod";

export const healthStatusSchema = z.object({
  status: z.literal("ok"),
  service: z.string().min(1),
  checkedAt: z.string().datetime(),
  checks: z.record(z.string(), z.enum(["ok", "error"])).optional()
});

export type HealthStatus = z.infer<typeof healthStatusSchema>;
