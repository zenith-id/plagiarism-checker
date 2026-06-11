import type { Context } from "hono";
import { AppError } from "../../shared/errors/AppError";
import { analysisPairParamsSchema, analysisResultsQuerySchema, analyzeQuerySchema } from "./analysis.schema";
import { getAnalysisResults, getPairDetail, getRanking, runAnalysis } from "./analysis.service";

export function analyzeHandler(c: Context) {
  const parsed = analyzeQuerySchema.safeParse({ course: c.req.query("course") || "" });
  if (!parsed.success) throw new AppError("Query analisis tidak valid", 400, parsed.error.flatten());
  return c.json(runAnalysis(parsed.data.course));
}

export function analysisResultsHandler(c: Context) {
  const parsed = analysisResultsQuerySchema.safeParse({ threshold: c.req.query("threshold") || "0" });
  if (!parsed.success) throw new AppError("Threshold tidak valid", 400, parsed.error.flatten());
  return c.json(getAnalysisResults(parsed.data.threshold));
}

export function analysisRankingHandler(c: Context) {
  return c.json(getRanking());
}

export function analysisPairHandler(c: Context) {
  const parsed = analysisPairParamsSchema.safeParse(c.req.param());
  if (!parsed.success) throw new AppError("Parameter pasangan tidak valid", 400, parsed.error.flatten());
  return c.json(getPairDetail(parsed.data.idA, parsed.data.idB));
}
