import { Hono } from "hono";
import { cors } from "hono/cors";
import { env } from "../config/env";
import { handleHttpError } from "../shared/errors/errorHandler";
import { requestIdMiddleware } from "../shared/middleware/requestId";
import { registerAppRoutes } from "./routes";

export function createHttpApp() {
  const app = new Hono();

  app.use("*", requestIdMiddleware);
  app.use("/api/*", cors({
    origin: env.corsOrigins,
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
  }));

  registerAppRoutes(app);
  app.onError((error, c) => handleHttpError(error, c));

  return app;
}
