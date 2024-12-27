import { Action } from "../types/action";
import { SolanaAgentKit } from "../agent";
import { z } from "zod";

const getTPSAction: Action = {
  name: "solana_get_tps",
  similes: [
    "get transactions per second",
    "check network speed",
    "network performance",
    "transaction throughput",
    "network tps"
  ],
  description: "Get the current transactions per second (TPS) of the Solana network",
  examples: [
    [
      {
        input: {},
        output: {
          status: "success",
          tps: 3500,
          message: "Current network TPS: 3500"
        },
        explanation: "Get the current TPS of the Solana network"
      }
    ]
  ],
  schema: z.object({}), // No input parameters required
  handler: async (agent: SolanaAgentKit, _input: Record<string, any>) => {
    try {
      const perfSamples = await agent.connection.getRecentPerformanceSamples();

      if (
        !perfSamples.length ||
        !perfSamples[0]?.numTransactions ||
        !perfSamples[0]?.samplePeriodSecs
      ) {
        return {
          status: "error",
          message: "No performance samples available"
        };
      }

      const tps = Math.round(
        perfSamples[0].numTransactions / perfSamples[0].samplePeriodSecs
      );

      return {
        status: "success",
        tps,
        message: `Current network TPS: ${tps}`
      };
    } catch (error: any) {
      return {
        status: "error",
        message: `Failed to get TPS: ${error.message}`
      };
    }
  }
};

export default getTPSAction; 