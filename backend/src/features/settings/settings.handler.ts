import type { Context } from "hono";
import { AppError } from "../../shared/errors/AppError";
import { settingsExclusionsSchema, updateSettingsSchema } from "./settings.schema";
import { getSettings, updateExclusions, updateSettings } from "./settings.service";

export function getSettingsHandler(c: Context) {
  return c.json(getSettings());
}

export async function updateSettingsHandler(c: Context) {
  const body = await c.req.json();
  const parsed = updateSettingsSchema.safeParse(body);
  if (!parsed.success) throw new AppError("Payload pengaturan tidak valid", 400, parsed.error.flatten());

  return c.json(updateSettings(parsed.data));
}

export async function updateSettingsExclusionsHandler(c: Context) {
  const body = await c.req.json();
  const parsed = settingsExclusionsSchema.safeParse(body);
  if (!parsed.success) throw new AppError("Payload pengecualian tidak valid", 400, parsed.error.flatten());

  return c.json(updateExclusions(parsed.data));
}
