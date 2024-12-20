import { send } from "helius-airship-core";
import { Keypair } from "@solana/web3.js";
import type { WorkerMessage, WorkerData, DrizzleDb, Closeable } from "./types";

let db: DrizzleDb | null = null;
let dbInitPromise: Promise<DrizzleDb | null> | null = null;

async function initializeDb(dbPath: string): Promise<DrizzleDb> {
  if (!dbInitPromise) {
    dbInitPromise = (async () => {
      if (!db) {
        try {
          if (typeof window !== "undefined") {
            const [{ SQLocalDrizzle }, { drizzle }, { sql }] =
              await Promise.all([
                // @ts-ignore
                import("sqlocal/drizzle"),
                import("drizzle-orm/sqlite-proxy"),
                import("drizzle-orm"),
              ]);

            const { driver, batchDriver } = new SQLocalDrizzle({
              databasePath: dbPath,
              verbose: false,
            });

            db = drizzle(driver, batchDriver);
            await db.run(sql`PRAGMA journal_mode = WAL;`);
            await db.run(sql`PRAGMA synchronous = normal;`);
          } else {
            const [{ drizzle }, { default: Database }] = await Promise.all([
              import("drizzle-orm/better-sqlite3"),
              import("better-sqlite3"),
            ]);

            const sqlite = new Database(dbPath);
            sqlite.exec("PRAGMA journal_mode = WAL;");
            sqlite.exec("PRAGMA synchronous = normal;");
            db = drizzle(sqlite);
          }
        } catch (error) {
          console.error("Worker database initialization failed:", error);
          throw error;
        }
      }
      return db;
    })();
  }

  const database = await dbInitPromise;
  if (!database) throw new Error("Worker database initialization failed");
  return database;
}

function postMessage(message: WorkerMessage) {
  if (typeof window !== "undefined") {
    self.postMessage(message);
  } else {
    const { parentPort } = require("worker_threads");
    parentPort?.postMessage(message);
  }
}

async function handleMessage(data: WorkerData) {
  let database: DrizzleDb | null = null;

  try {
    database = await initializeDb(data.data.dbPath);

    switch (data.type) {
      case "send":
        if (!data.data.secretKey) {
          throw new Error("Secret key is required for send operation");
        }

        await send({
          db: database,
          keypair: Keypair.fromSecretKey(new Uint8Array(data.data.secretKey)),
          url: data.data.url,
        });

        break;
    }

    postMessage({ type: "complete" });
  } catch (error) {
    console.error("[Worker] Operation failed:", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      type: data.type,
      url: data.data.url,
    });

    postMessage({
      type: "error",
      error: error instanceof Error ? error.message : String(error),
    });
  } finally {
    if (database && "close" in database) {
      try {
        await (database as Closeable).close();
      } catch (error) {
        console.error("Error closing database connection:", error);
      }
    }
  }
}

if (typeof window !== "undefined") {
  self.onmessage = (event: MessageEvent<WorkerData>) => {
    handleMessage(event.data).catch((error) => {
      postMessage({
        type: "error",
        error: error instanceof Error ? error.message : String(error),
      });
    });
  };
} else {
  const { parentPort } = require("worker_threads");
  parentPort?.on("message", (data: WorkerData) => {
    handleMessage(data).catch((error) => {
      postMessage({
        type: "error",
        error: error instanceof Error ? error.message : String(error),
      });
    });
  });
}
