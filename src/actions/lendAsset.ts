import { Action } from "../types/action";
import { SolanaAgentKit } from "../agent";
import { z } from "zod";
import { VersionedTransaction } from "@solana/web3.js";

const lendAssetAction: Action = {
  name: "solana_lend_asset",
  similes: [
    "lend usdc",
    "deposit for yield",
    "earn yield",
    "lend with lulo",
    "deposit usdc",
    "lending"
  ],
  description: "Lend USDC tokens to earn yield using Lulo protocol",
  examples: [
    [
      {
        input: {
          amount: 100
        },
        output: {
          status: "success",
          signature: "4xKpN2...",
          message: "Successfully lent 100 USDC"
        },
        explanation: "Lend 100 USDC to earn yield on Lulo"
      }
    ]
  ],
  schema: z.object({
    amount: z.number()
      .positive()
      .describe("Amount of USDC to lend")
  }),
  handler: async (agent: SolanaAgentKit, input: Record<string, any>) => {
    try {
      const amount = input.amount as number;

      const response = await fetch(
        `https://blink.lulo.fi/actions?amount=${amount}&symbol=USDC`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            account: agent.wallet.publicKey.toBase58(),
          }),
        }
      );

      if (!response.ok) {
        return {
          status: "error",
          message: `Failed to get lending transaction: ${response.statusText}`
        };
      }

      const data = await response.json();

      // Deserialize the transaction
      const luloTxn = VersionedTransaction.deserialize(
        Buffer.from(data.transaction, "base64")
      );

      // Get a recent blockhash and set it
      const { blockhash } = await agent.connection.getLatestBlockhash();
      luloTxn.message.recentBlockhash = blockhash;

      // Sign and send transaction
      luloTxn.sign([agent.wallet]);
      const signature = await agent.connection.sendTransaction(luloTxn, {
        preflightCommitment: "confirmed",
        maxRetries: 3,
      });

      // Wait for confirmation
      const latestBlockhash = await agent.connection.getLatestBlockhash();
      await agent.connection.confirmTransaction({
        signature,
        blockhash: latestBlockhash.blockhash,
        lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
      });

      return {
        status: "success",
        signature,
        message: `Successfully lent ${amount} USDC`
      };
    } catch (error: any) {
      return {
        status: "error",
        message: `Lending failed: ${error.message}`
      };
    }
  }
};

export default lendAssetAction; 