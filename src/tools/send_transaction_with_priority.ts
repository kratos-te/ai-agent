import { SolanaAgentKit } from "../agent";
import {
  SystemProgram,
  Transaction,
  sendAndConfirmTransaction,
  ComputeBudgetProgram,
  PublicKey,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import bs58 from "bs58";
import { PriorityFeeTransaction } from "../types";

/**
 * Fetches an estimated priority fee (in microLamports) from Helius.
 *
 * @param agent         An instance of SolanaAgentKit containing connection, wallet, etc.
 * @param priorityLevel The priority level (e.g. "Min", "Low", "Medium", "High", "VeryHigh", or "UnsafeMax").
 * @param transaction   The (unsigned or partially-signed) Transaction you want to estimate fees for.
 * @returns             The numeric priority fee estimate in microLamports.
 */
export async function getPriorityFeeEstimate(
  agent: SolanaAgentKit,
  priorityLevel: string,
  transaction: Transaction,
): Promise<number> {
  const apiKey = agent.config.HELIUS_API_KEY;
  if (!apiKey) {
    throw new Error(
      "HELIUS_API_KEY not found in agent.config or environment variables",
    );
  }

  const url = `https://api.helius.xyz/v0/transactions/?api-key=${apiKey}`;

  const payload = {
    jsonrpc: "2.0",
    id: "1",
    method: "getPriorityFeeEstimate",
    params: [
      {
        transaction: bs58.encode(transaction.serialize()),
        options: { priorityLevel },
      },
    ],
  };
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Helius request failed with status ${response.status}`);
  }

  const data = await response.json();
  if (!data.result || data.result.priorityFeeEstimate === undefined) {
    throw new Error(`Invalid response from Helius: ${JSON.stringify(data)}`);
  }

  return data.result.priorityFeeEstimate;
}

/**
 * Sends a transaction with an optional priority fee using the provided SolanaAgentKit.
 *
 * @param agent         An instance of SolanaAgentKit containing connection, wallet, etc.
 * @param priorityLevel The priority level ("NONE", "Min", "Low", "Medium", "High", "VeryHigh", or "UnsafeMax").
 * @param amount        The amount of SOL to send (in SOL, not lamports).
 * @param to            The recipient's PublicKey.
 * @returns             The transaction signature (string) once confirmed.
 */

export async function sendTransactionWithPriorityFee(
  agent: SolanaAgentKit,
  priorityLevel: string,
  amount: number,
  to: PublicKey,
): Promise<PriorityFeeTransaction> {
  const transaction = new Transaction();

  const transferIx = SystemProgram.transfer({
    fromPubkey: agent.wallet_address,
    toPubkey: to,
    lamports: amount * LAMPORTS_PER_SOL,
  });
  transaction.add(transferIx);

  let feeEstimate = 0;
  if (priorityLevel !== "NONE") {
    feeEstimate = await getPriorityFeeEstimate(
      agent,
      priorityLevel,
      transaction,
    );
    if (feeEstimate > 0) {
      const computePriceIx = ComputeBudgetProgram.setComputeUnitPrice({
        microLamports: feeEstimate,
      });
      transaction.add(computePriceIx);
    }
  }

  transaction.recentBlockhash = (
    await agent.connection.getLatestBlockhash()
  ).blockhash;
  transaction.sign(agent.wallet);

  const txSignature = await sendAndConfirmTransaction(
    agent.connection,
    transaction,
    [agent.wallet],
  );

  return {
    transactionId: txSignature,
    fee: feeEstimate,
  };
}
