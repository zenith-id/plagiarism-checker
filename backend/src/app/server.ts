import { env } from "../config/env";
import { logger } from "../shared/utils/logger";
import { createHttpApp } from "./http";

const app = createHttpApp();

logger.info(`Server berjalan di http://localhost:${env.port}`);

export default {
  port: env.port,
  fetch: app.fetch,
};
