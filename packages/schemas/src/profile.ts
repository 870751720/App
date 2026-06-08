import { z } from "zod";

export const profileMetricSchema = z.object({
  label: z.string().min(1),
  value: z.string().min(1),
  detail: z.string().min(1)
});

export const stackAreaSchema = z.object({
  title: z.string().min(1),
  summary: z.string().min(1),
  tools: z.array(z.string().min(1)).min(1)
});

export const profileProjectSchema = z.object({
  name: z.string().min(1),
  summary: z.string().min(1),
  status: z.string().min(1),
  tags: z.array(z.string().min(1)).min(1)
});

export const journalEntrySchema = z.object({
  date: z.string().min(1),
  title: z.string().min(1),
  summary: z.string().min(1)
});

export const profileHeroSchema = z.object({
  handle: z.string().min(1),
  title: z.string().min(1),
  summary: z.string().min(1),
  primaryAction: z.string().min(1),
  secondaryAction: z.string().min(1)
});

export const contactPreferenceSchema = z.object({
  title: z.string().min(1),
  summary: z.string().min(1),
  channels: z.array(z.string().min(1)).min(1)
});

export const profileContentSchema = z.object({
  hero: profileHeroSchema,
  metrics: z.array(profileMetricSchema).min(1),
  stackAreas: z.array(stackAreaSchema).min(1),
  projects: z.array(profileProjectSchema).min(1),
  journalEntries: z.array(journalEntrySchema).min(1),
  contactPreference: contactPreferenceSchema
});

export type ProfileContentResponse = z.infer<typeof profileContentSchema>;
