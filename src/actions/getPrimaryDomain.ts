import { Action } from "../types/action";
import { SolanaAgentKit } from "../agent";
import { z } from "zod";
import { getPrimaryDomain as _getPrimaryDomain } from "@bonfida/spl-name-service";
import { PublicKey } from "@solana/web3.js";

const getPrimaryDomainAction: Action = {
  name: "solana_get_primary_domain",
  similes: [
    "get primary domain",
    "lookup primary domain",
    "check primary domain",
    "find primary domain",
    "get main domain",
    "primary sol domain"
  ],
  description: "Get the primary .sol domain associated with a Solana wallet address",
  examples: [
    [
      {
        input: {
          account: "7nxQB..."
        },
        output: {
          status: "success",
          domain: "vitalik.sol",
          message: "Primary domain: vitalik.sol"
        },
        explanation: "Get the primary .sol domain for a wallet address"
      }
    ]
  ],
  schema: z.object({
    account: z.string()
      .min(1)
      .describe("The Solana wallet address to lookup")
  }),
  handler: async (agent: SolanaAgentKit, input: Record<string, any>) => {
    try {
      const account = new PublicKey(input.account);

      const { reverse, stale } = await _getPrimaryDomain(
        agent.connection,
        account
      );

      if (stale) {
        return {
          status: "error",
          message: `Primary domain is stale for account: ${account.toBase58()}`
        };
      }

      return {
        status: "success",
        domain: reverse,
        message: `Primary domain: ${reverse}`
      };
    } catch (error: any) {
      return {
        status: "error",
        message: `Failed to get primary domain: ${error.message}`
      };
    }
  }
};

export default getPrimaryDomainAction; 