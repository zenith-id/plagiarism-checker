import { z } from "zod";

export const analyzeQuerySchema = z.object({
  course: z.string().default(""),
});

export const analysisResultsQuerySchema = z.object({
  threshold: z.coerce.number().min(0).default(0),
});

export const analysisPairParamsSchema = z.object({
  idA: z.string().min(1),
  idB: z.string().min(1),
});
