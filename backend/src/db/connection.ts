/**
 * Database connection module
 * In-memory storage is default (app-state.ts).
 * Enable SQLite/Postgres when persistent storage needed.
 */

// Bun.sqlite example (commented):
// import { Database } from "bun:sqlite";
// export const db = new Database(":memory:");

export const db = null;

export function isDbConnected(): boolean {
  return db !== null;
}
