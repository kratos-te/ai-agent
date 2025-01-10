import { z } from "zod";
import type { Action } from "../../types";
import type { SolanaAgentKit } from "../..";
import { createVault } from "../../tools/drift_vault";

const createDriftVaultAction: Action = {
  name: "CREATE_DRIFT_VAULT",
  similes: ["create a drift vault", "open a drift vault", "create vault"],
  description:
    "Create a new drift vault delegating the agents address as the owner.",
  examples: [
    [
      {
        input: {},
        output: {
          status: "success",
          message: "Drift vault created successfully",
          signature:
            "2nFeP7taii3wGVgrWk4YiLMPmhtu3Zg9iXCUu4zGBDadwunHw8reXFxRWT7khbFsQ9JT3zK4RYDLNDFDRYvM3wJk",
        },
        explanation: "Create a drift vault",
      },
    ],
  ],
  schema: z.object({
    name: z.string().min(5, "Name must be at least 5 characters"),
    // regex matches SOL-SPOT
    marketName: z.string().regex(/^([A-Za-z0-9]{2,7})-SPOT$/),
    redeemPeriod: z.number().int().min(1, "Redeem period must be at least 1"),
    maxTokens: z.number().int().min(100, "Max tokens must be at least 100"),
    minDepositAmount: z.number().positive(),
    managementFee: z.number().positive().max(20),
    profitShare: z.number().positive().max(90).optional().default(5),
    handleRate: z.number().optional(),
    permissioned: z
      .boolean()
      .optional()
      .describe("Should the vault have a whitelist of not"),
  }),
  handler: async (agent: SolanaAgentKit, input) => {
    try {
      const tx = await createVault(
        agent,
        // @ts-expect-error - zod schema validation
        {
          ...input,
        },
      );

      return {
        status: "success",
        message: "Drift vault created successfully",
        signature: tx,
      };
    } catch (e) {
      return {
        status: "error",
        // @ts-expect-error - e is not a string
        message: `Failed to create drift vault: ${e.message}`,
      };
    }
  },
};

export default createDriftVaultAction;
