import { z } from "zod";

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

export const env = {
  nodeEnv: parsedEnv.NODE_ENV,
  port: parsedEnv.BACKEND_PORT ?? parsedEnv.PORT,
  corsOrigins: parsedEnv.CORS_ORIGINS.split(",").map((origin) => origin.trim()).filter(Boolean),
};
