import type { HealthStatus } from "./health.types";

export function getHealthSnapshot(): HealthStatus {
  return { name: "Plagiarism Checker API", version: "1.0.0", status: "running" };
}
