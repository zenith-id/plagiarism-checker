import { Hono } from "hono";
import { analysisPairHandler, analysisRankingHandler, analysisResultsHandler, analyzeHandler } from "./analysis.handler";

export function createAnalysisRoutes() {
  const app = new Hono();

  app.post("/analyze", analyzeHandler);
  app.get("/results", analysisResultsHandler);
  app.get("/ranking", analysisRankingHandler);
  app.get("/pair/:idA/:idB", analysisPairHandler);

  return app;
}
