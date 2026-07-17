import { Hono } from "hono";
import { cors } from "hono/cors";
import { z } from "zod";
import { createAnalysisRoutes } from "./features/analysis";
import { createFilesRoutes } from "./features/documents";
import { createHealthRoutes } from "./features/health";
import { createReportsRoutes } from "./features/export";
import { createSettingsRoutes } from "./features/settings";
import { handleHttpError } from "./shared/errors/errorHandler";
import { requestIdMiddleware } from "./shared/middleware/requestId";
import { logger } from "./shared/utils/logger";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(3002),
  BACKEND_PORT: z.coerce.number().int().positive().optional(),
  CORS_ORIGINS: z.string().default("http://localhost:3000,http://localhost:3001"),
});

const parsedEnv = envSchema.parse({
  NODE_ENV: Bun.env.NODE_ENV,
  PORT: Bun.env.PORT,
  BACKEND_PORT: Bun.env.BACKEND_PORT,
  CORS_ORIGINS: Bun.env.CORS_ORIGINS,
});

const env = {
  nodeEnv: parsedEnv.NODE_ENV,
  port: parsedEnv.BACKEND_PORT ?? parsedEnv.PORT,
  corsOrigins: parsedEnv.CORS_ORIGINS.split(",").map((origin) => origin.trim()).filter(Boolean),
};

function createHttpApp() {
  const app = new Hono();

  app.use("*", requestIdMiddleware);
  app.use("/api/*", cors({
    origin: env.corsOrigins,
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
  }));

  app.route("/api", createFilesRoutes());
  app.route("/api", createAnalysisRoutes());
  app.route("/api", createReportsRoutes());
  app.route("/api", createSettingsRoutes());
  app.route("/", createHealthRoutes());

  app.onError((error, c) => handleHttpError(error, c));

  return app;
}

const app = createHttpApp();

logger.info(`Server berjalan di http://localhost:${env.port}`);

export default {
  port: env.port,
  fetch: app.fetch,
};
