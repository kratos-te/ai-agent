import { z } from "zod";
import type { Action } from "../../types";
import { withdrawFromDriftUserAccount } from "../../tools";

const withdrawFromDriftAccountAction: Action = {
  name: "WITHDRAW_FROM_DRIFT_ACCOUNT",
  description: "Withdraw funds from your drift account",
  similes: [
    "withdraw from drift account",
    "withdraw funds from drift account",
    "withdraw funds from my drift account",
  ],
  examples: [
    [
      {
        input: {
          amount: 100,
          symbol: "usdc",
        },
        output: {
          status: "success",
          message: "Funds withdrawn successfully",
          signature:
            "2nFeP7taii3wGVgrWk4YiLMPmhtu3Zg9iXCUu4zGBDadwunHw8reXFxRWT7khbFsQ9JT3zK4RYDLNDFDRYvM3wJk",
        },
        explanation: "Withdraw 100 USDC from your drift account",
      },
    ],
  ],
  schema: z.object({
    amount: z
      .number()
      .positive()
      .describe(
        "The amount in tokens you'd like to withdraw from your drift account",
      ),
    symbol: z
      .string()
      .toUpperCase()
      .describe("The symbol of the token you'd like to withdraw"),
  }),
  handler: async (agent, input) => {
    try {
      const tx = await withdrawFromDriftUserAccount(
        agent,
        input.amount,
        input.symbol,
      );

      return {
        status: "success",
        message: "Funds withdrawn successfully",
        signature: tx,
      };
    } catch (e) {
      return {
        status: "error",
        // @ts-expect-error - error message is a string
        message: `Failed to withdraw funds: ${e.message}`,
      };
    }
  },
};

export default withdrawFromDriftAccountAction;
