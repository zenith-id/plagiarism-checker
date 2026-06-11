import { Hono } from "hono";
import { exportPdfHandler } from "./reports.handler";

export function createReportsRoutes() {
  const app = new Hono();

  app.get("/export/pdf", exportPdfHandler);

  return app;
}
