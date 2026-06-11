import { getHealthSnapshot } from "./health.repository";

export function getHealthStatus() {
  return getHealthSnapshot();
}
