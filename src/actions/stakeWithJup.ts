import { Action } from "../types/action";
import { SolanaAgentKit } from "../agent";
import { z } from "zod";
import { VersionedTransaction } from "@solana/web3.js";

const stakeWithJupAction: Action = {
  name: "solana_stake_with_jup",
  similes: [
    "stake sol",
    "stake with jupiter",
    "jup staking",
    "stake with jup",
    "liquid staking",
    "get jupsol"
  ],
  description: "Stake SOL tokens with Jupiter's liquid staking protocol to receive jupSOL",
  examples: [
    [
      {
        input: {
          amount: 1.5
        },
        output: {
          status: "success",
          signature: "5KtPn3...",
          message: "Successfully staked 1.5 SOL for jupSOL"
        },
        explanation: "Stake 1.5 SOL to receive jupSOL tokens"
      }
    ]
  ],
  schema: z.object({
    amount: z.number()
      .positive()
      .describe("Amount of SOL to stake")
  }),
  handler: async (agent: SolanaAgentKit, input: Record<string, any>) => {
    try {
      const amount = input.amount as number;
      
      // Get staking transaction from Jupiter
      const res = await fetch(
        `https://worker.jup.ag/blinks/swap/So11111111111111111111111111111111111111112/jupSoLaHXQiZZTSfEWMTRRgpnyFm8f6sZdosWBjx93v/${amount}`,
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

      if (!res.ok) {
        return {
          status: "error",
          message: `Failed to get staking transaction: ${res.statusText}`
        };
      }

      const data = await res.json();

      // Deserialize and prepare transaction
      const txn = VersionedTransaction.deserialize(
        Buffer.from(data.transaction, "base64")
      );

      const { blockhash } = await agent.connection.getLatestBlockhash();
      txn.message.recentBlockhash = blockhash;

      // Sign and send transaction
      txn.sign([agent.wallet]);
      const signature = await agent.connection.sendTransaction(txn, {
        preflightCommitment: "confirmed",
        maxRetries: 3,
      });

      // Confirm transaction
      const latestBlockhash = await agent.connection.getLatestBlockhash();
      await agent.connection.confirmTransaction({
        signature,
        blockhash: latestBlockhash.blockhash,
        lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
      });

      return {
        status: "success",
        signature,
        message: `Successfully staked ${amount} SOL for jupSOL`
      };
    } catch (error: any) {
      return {
        status: "error",
        message: `jupSOL staking failed: ${error.message}`
      };
    }
  }
};

export default stakeWithJupAction; 