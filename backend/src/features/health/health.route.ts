import { Hono } from "hono";
import { healthHandler } from "./health.handler";

export function createHealthRoutes() {
  const app = new Hono();

  app.get("/", healthHandler);

  return app;
}
