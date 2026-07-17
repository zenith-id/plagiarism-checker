import type { Context } from "hono";
import { AppError } from "./AppError";

export function handleHttpError(error: unknown, c: Context) {
  if (error instanceof AppError) {
    return c.json({ error: error.message, details: error.details }, error.statusCode as any);
  }

  const message = error instanceof Error ? error.message : "Terjadi kesalahan internal";
  return c.json({ error: message }, 500);
}
