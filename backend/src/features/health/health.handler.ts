import type { Context } from "hono";
import { healthSchema } from "./health.schema";
import { getHealthStatus } from "./health.service";

export function healthHandler(c: Context) {
  healthSchema.parse({});
  return c.json(getHealthStatus());
}
