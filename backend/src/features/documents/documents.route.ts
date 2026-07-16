import { Hono } from "hono";
import { resetFilesHandler, uploadFilesHandler } from "./documents.handler";

export function createFilesRoutes() {
  const app = new Hono();

  app.post("/upload", uploadFilesHandler);
  app.post("/reset", resetFilesHandler);

  return app;
}
