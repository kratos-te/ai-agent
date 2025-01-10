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
import { PriorityFeeTransaction, PriorityFeeResponse } from "../types";

/**
 * Sends a transaction with an estimated priority fee using the provided SolanaAgentKit.
 *
 * @param agent         An instance of SolanaAgentKit containing connection, wallet, etc.
 * @param priorityLevel The priority level (e.g., "Min", "Low", "Medium", "High", "VeryHigh", or "UnsafeMax").
 * @param amount        The amount of SOL to send (in SOL, not lamports).
 * @param to            The recipient's PublicKey.
 * @returns             The transaction signature (string) once confirmed along with the fee used.
 */
export async function sendTransactionWithPriorityFee(
  agent: SolanaAgentKit,
  priorityLevel: string,
  amount: number,
  to: PublicKey,
): Promise<PriorityFeeTransaction> {
  const transaction = new Transaction();
  const { blockhash, lastValidBlockHeight } =
    await agent.connection.getLatestBlockhash();
  transaction.recentBlockhash = blockhash;
  transaction.lastValidBlockHeight = lastValidBlockHeight;
  transaction.feePayer = agent.wallet_address;

  const transferIx = SystemProgram.transfer({
    fromPubkey: agent.wallet_address,
    toPubkey: to,
    lamports: amount * LAMPORTS_PER_SOL,
  });

  transaction.add(transferIx);
  transaction.sign(agent.wallet);

  const response = await fetch(
    `https://mainnet.helius-rpc.com/?api-key=${agent.config.HELIUS_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: "1",
        method: "getPriorityFeeEstimate",
        params: [
          {
            transaction: bs58.encode(transaction.serialize()),
            options: { priorityLevel: priorityLevel },
          },
        ],
      } as PriorityFeeResponse),
    },
  );

  const data = await response.json();
  if (data.error) {
    throw new Error("Error fetching priority fee:");
  }
  const feeEstimate: number = data.result.priorityFeeEstimate;

  // Set the priority fee if applicable
  const computePriceIx = ComputeBudgetProgram.setComputeUnitPrice({
    microLamports: feeEstimate,
  });
  transaction.add(computePriceIx);

  // Send the transaction and confirm
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
