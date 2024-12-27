import { Action } from "../types/action";
import { SolanaAgentKit } from "../agent";
import { z } from "zod";
import { PublicKey, VersionedTransaction } from "@solana/web3.js";

const createGibworkTaskAction: Action = {
  name: "solana_create_gibwork_task",
  similes: [
    "create task",
    "post job",
    "create gig",
    "post task",
    "create work",
    "new task on gibwork"
  ],
  description: "Create a new task on the Gibwork platform with payment in SPL tokens",
  examples: [
    [
      {
        input: {
          title: "Build a Solana dApp",
          content: "Create a simple Solana dApp with React frontend",
          requirements: "Experience with Rust and React",
          tags: ["solana", "rust", "react"],
          tokenMintAddress: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
          tokenAmount: 100
        },
        output: {
          status: "success",
          taskId: "task_123",
          signature: "3YKpM1...",
          message: "Successfully created task: Build a Solana dApp"
        },
        explanation: "Create a new task on Gibwork with 100 USDC payment"
      }
    ]
  ],
  schema: z.object({
    title: z.string()
      .min(1)
      .describe("Title of the task"),
    content: z.string()
      .min(1)
      .describe("Description of the task"),
    requirements: z.string()
      .min(1)
      .describe("Requirements to complete the task"),
    tags: z.array(z.string())
      .min(1)
      .describe("List of tags associated with the task"),
    tokenMintAddress: z.string()
      .describe("Token mint address for payment"),
    tokenAmount: z.number()
      .positive()
      .describe("Payment amount for the task"),
    payer: z.string()
      .optional()
      .describe("Optional payer address (defaults to wallet address)")
  }),
  handler: async (agent: SolanaAgentKit, input: Record<string, any>) => {
    try {
      const tokenMintAddress = new PublicKey(input.tokenMintAddress);
      const payer = input.payer ? new PublicKey(input.payer) : undefined;

      const apiResponse = await fetch(
        "https://api2.gib.work/tasks/public/transaction",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: input.title,
            content: input.content,
            requirements: input.requirements,
            tags: input.tags,
            payer: payer?.toBase58() || agent.wallet.publicKey.toBase58(),
            token: {
              mintAddress: tokenMintAddress.toBase58(),
              amount: input.tokenAmount,
            },
          }),
        }
      );

      if (!apiResponse.ok) {
        return {
          status: "error",
          message: `Failed to create task: ${apiResponse.statusText}`
        };
      }

      const responseData = await apiResponse.json();
      if (!responseData.taskId || !responseData.serializedTransaction) {
        return {
          status: "error",
          message: responseData.message || "Invalid response from Gibwork API"
        };
      }

      const serializedTransaction = Buffer.from(
        responseData.serializedTransaction,
        "base64"
      );
      const tx = VersionedTransaction.deserialize(serializedTransaction);

      tx.sign([agent.wallet]);
      const signature = await agent.connection.sendTransaction(tx, {
        preflightCommitment: "confirmed",
        maxRetries: 3,
      });

      const latestBlockhash = await agent.connection.getLatestBlockhash();
      await agent.connection.confirmTransaction({
        signature,
        blockhash: latestBlockhash.blockhash,
        lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
      });

      return {
        status: "success",
        taskId: responseData.taskId,
        signature,
        message: `Successfully created task: ${input.title}`
      };
    } catch (error: any) {
      return {
        status: "error",
        message: `Failed to create task: ${error.message}`
      };
    }
  }
};

export default createGibworkTaskAction; 