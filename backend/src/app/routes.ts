import type { Hono } from "hono";
import { createAnalysisRoutes } from "../features/analysis";
import { createFilesRoutes } from "../features/files";
import { createHealthRoutes } from "../features/health";
import { createReportsRoutes } from "../features/reports";
import { createSettingsRoutes } from "../features/settings";

export function registerAppRoutes(app: Hono) {
  app.route("/api", createFilesRoutes());
  app.route("/api", createAnalysisRoutes());
  app.route("/api", createReportsRoutes());
  app.route("/api", createSettingsRoutes());
  app.route("/", createHealthRoutes());
}
