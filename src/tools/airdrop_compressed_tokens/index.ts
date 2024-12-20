import { PublicKey } from "@solana/web3.js";
import type { DrizzleDb, WorkerMessage, WorkerData } from "./types";
import { SolanaAgentKit } from "../../agent/index.js";

let db: DrizzleDb | null = null;
let dbInitPromise: Promise<DrizzleDb | null> | null = null;

async function configureForBrowser() {
  try {
    const [{ SQLocalDrizzle }, { drizzle }, { sql }, heliusCore] =
      await Promise.all([
        // @ts-ignore
        import("sqlocal/drizzle"),
        import("drizzle-orm/sqlite-proxy"),
        import("drizzle-orm"),
        import("helius-airship-core"),
      ]);

    const { databaseFile } = heliusCore;

    const { driver, batchDriver } = new SQLocalDrizzle({
      databasePath: databaseFile,
      verbose: false,
    });

    const database = drizzle(driver, batchDriver);
    await database.run(sql`PRAGMA journal_mode = WAL;`);
    await database.run(sql`PRAGMA synchronous = normal;`);

    return database;
  } catch (error) {
    console.error("Browser database configuration failed:", error);
    throw error;
  }
}

async function configureForNode() {
  try {
    const [{ drizzle }, { default: Database }, { databaseFile }] =
      await Promise.all([
        import("drizzle-orm/better-sqlite3"),
        import("better-sqlite3"),
        import("helius-airship-core"),
      ]);

    const sqlite = new Database(databaseFile);
    sqlite.exec("PRAGMA journal_mode = WAL;");
    sqlite.exec("PRAGMA synchronous = normal;");

    return drizzle(sqlite);
  } catch (error) {
    console.error("Node database configuration failed:", error);
    throw error;
  }
}

async function configureDatabase(): Promise<DrizzleDb> {
  if (!dbInitPromise) {
    dbInitPromise = (async () => {
      if (!db) {
        db =
          typeof window !== "undefined"
            ? await configureForBrowser()
            : await configureForNode();
      }
      return db;
    })();
  }

  const database = await dbInitPromise;
  if (!database) throw new Error("Database initialization failed");
  return database;
}
async function createWorker(): Promise<
  Worker | import("worker_threads").Worker
> {
  if (typeof window !== "undefined") {
    const origin = new URL(window.location.href).origin;
    if (
      !origin.startsWith("https://") &&
      !origin.startsWith("http://localhost")
    ) {
      throw new Error("Invalid origin protocol");
    }

    const workerCode = `
      self.importScripts('${origin}/airdrop-worker.js'.replace(/[<>'"]/g, ''));
    `;

    const blobOptions = {
      type: "application/javascript",
      headers: {
        "Content-Security-Policy": "default-src 'self'",
      },
    };

    const blob = new Blob([workerCode], blobOptions);
    const workerUrl = URL.createObjectURL(blob);
    const worker = new Worker(workerUrl);
    URL.revokeObjectURL(workerUrl);
    return worker;
  } else {
    // Node
    const { Worker } = await import("worker_threads");
    const path = await import("path");

    return new Worker(path.resolve(__dirname, "worker.js"));
  }
}

/**
 * Create airdrop with zk compression
 * @param agent         Agent
 * @param mintAddress   Token mint public key (non token-2022)
 * @param amount        amount of tokens to airdrop per recipient
 * @param recipients    Recipient public keys
 */
export async function createCompressedAirdrop(
  agent: SolanaAgentKit,
  mintAddress: PublicKey,
  amount: bigint,
  recipients: PublicKey[]
): Promise<void> {
  try {
    const database = await configureDatabase();
    const { create, init } = await import("helius-airship-core");

    await init({
      db: database as any,
    });

    await create({
      db: database as any,
      signer: agent.wallet.publicKey,
      addresses: recipients,
      amount,
      mintAddress,
    });
  } catch (error) {
    console.error("Create operation failed:", error);
    throw error;
  }
}

/**
 * Send airdrop. must be called after `createCompressedAirdrop`
 * @param agent       Agent
 * @param onProgress  Callback for progress updates
 * @param onError     Callback for error handling
 */
export async function sendCompressedAirdrop(
  agent: SolanaAgentKit,
  onProgress?: (progress: number) => void,
  onError?: (error: Error) => void
): Promise<void> {
  let worker: Worker | import("worker_threads").Worker | null = null;
  const { databaseFile } = await import("helius-airship-core");

  return new Promise(async (resolve, reject) => {
    const cleanup = () => {
      if (worker) {
        try {
          if ("terminate" in worker) {
            worker.terminate();
          }
        } catch (error) {
          console.error("[Main] Worker cleanup error:", error);
        }
      }
    };

    try {
      worker = await createWorker();

      const message: WorkerData = {
        type: "send",
        data: {
          secretKey: Array.from(agent.wallet.secretKey),
          url: agent.connection.rpcEndpoint,
          dbPath: databaseFile,
        },
      };

      const handleMessage = (event: MessageEvent<WorkerMessage>) => {
        if (event.data === undefined) {
          cleanup();
          reject(new Error());
          return;
        }
        const { type, data, error } = event.data;
        switch (type) {
          case "progress":
            onProgress?.(data!);
            break;
          case "error":
            cleanup();
            const errorObj = new Error(error);
            onError?.(errorObj);
            reject(errorObj);
            break;
          case "complete":
            cleanup();
            resolve();
            break;
        }
      };

      if (typeof window !== "undefined") {
        (worker as Worker).onmessage = handleMessage;
      } else {
        (worker as import("worker_threads").Worker).on(
          "message",
          handleMessage
        );
      }

      worker.postMessage(message);
    } catch (error) {
      cleanup();
      console.error("[Main] Send operation failed:", {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
      onError?.(error instanceof Error ? error : new Error(String(error)));
      reject(error);
    }
  });
}
