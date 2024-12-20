import type { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import type { SqliteRemoteDatabase } from "drizzle-orm/sqlite-proxy";

export interface Closeable {
  close(): Promise<void> | void;
}

export type DrizzleDb = BetterSQLite3Database | SqliteRemoteDatabase;

export interface WorkerMessage {
  type: "progress" | "error" | "complete";
  data?: number;
  error?: string;
}

export interface WorkerData {
  type: "send" | "poll";
  data: {
    dbPath: string;
    url: string;
    secretKey?: number[];
  };
}

export interface WorkerError extends Error {
  code?: string;
  type: "worker_error";
}

export interface DatabaseError extends Error {
  code?: string;
  type: "database_error";
}

export function isWorkerMessage(message: any): message is WorkerMessage {
  return (
    message &&
    typeof message === "object" &&
    "type" in message &&
    (message.type === "progress" ||
      message.type === "error" ||
      message.type === "complete")
  );
}

export function isWorkerData(data: any): data is WorkerData {
  return (
    data &&
    typeof data === "object" &&
    "type" in data &&
    (data.type === "send" || data.type === "poll") &&
    "data" in data &&
    typeof data.data === "object" &&
    typeof data.data.dbPath === "string" &&
    typeof data.data.url === "string"
  );
}

export function isWorkerError(error: any): error is WorkerError {
  return (
    error instanceof Error && "type" in error && error.type === "worker_error"
  );
}

export function isDatabaseError(error: any): error is DatabaseError {
  return (
    error instanceof Error && "type" in error && error.type === "database_error"
  );
}
