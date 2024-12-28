import { Action } from "../types/action";
import { SolanaAgentKit } from "../agent";
import { z } from "zod";
import { VersionedTransaction } from "@solana/web3.js";
import { lendAsset } from "../tools";

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

      const response = await lendAsset(agent, amount);

      return {
        status: "success",
        signature: response,
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