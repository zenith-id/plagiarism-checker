import { z } from "zod";

export const updateSettingsSchema = z.object({
  thresholdSafe: z.number().min(0).max(100).optional(),
  thresholdWarning: z.number().min(0).max(100).optional(),
  thresholdDanger: z.number().min(0).max(100).optional(),
  courseExclusions: z.record(z.string(), z.array(z.string())).optional(),
});

export const settingsExclusionsSchema = z.object({
  course: z.string().min(1),
  words: z.array(z.string().min(1)),
});
