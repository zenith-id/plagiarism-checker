import { Hono } from "hono";
import { getSettingsHandler, updateSettingsExclusionsHandler, updateSettingsHandler } from "./settings.handler";

export function createSettingsRoutes() {
  const app = new Hono();

  app.get("/settings", getSettingsHandler);
  app.put("/settings", updateSettingsHandler);
  app.post("/settings/exclusions", updateSettingsExclusionsHandler);

  return app;
}
