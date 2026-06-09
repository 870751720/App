import { z } from "zod";
import { userRoleSchema } from "./identity.js";

export const operationStateSchema = z.enum(["healthy", "warning", "offline"]);

export const operationMetricSchema = z.object({
  label: z.string().min(1),
  value: z.string().min(1),
  detail: z.string().min(1),
  state: operationStateSchema
});

export const managedServiceSchema = z.object({
  name: z.string().min(1),
  target: z.string().min(1),
  state: operationStateSchema,
  detail: z.string().min(1)
});

export const projectEntrySchema = z.object({
  name: z.string().min(1),
  stage: z.string().min(1),
  summary: z.string().min(1),
  ownerRole: userRoleSchema
});

export const operationActionSchema = z.object({
  label: z.string().min(1),
  description: z.string().min(1),
  minimumRole: userRoleSchema
});

export const operationsOverviewSchema = z.object({
  generatedAt: z.string().datetime(),
  metrics: z.array(operationMetricSchema).min(1),
  services: z.array(managedServiceSchema).min(1),
  projects: z.array(projectEntrySchema).min(1),
  actions: z.array(operationActionSchema).min(1)
});

export type OperationsOverviewResponse = z.infer<typeof operationsOverviewSchema>;
