import { Action } from "../types/action";
import { SolanaAgentKit } from "../agent";
import { z } from "zod";
import { resolve } from "@bonfida/spl-name-service";

const resolveSolDomainAction: Action = {
  name: "solana_resolve_sol_domain",
  similes: [
    "resolve sol domain",
    "lookup sol domain",
    "get sol domain owner",
    "check sol domain",
    "find sol domain owner",
    "resolve .sol"
  ],
  description: "Resolve a .sol domain to its corresponding Solana wallet address using Bonfida Name Service",
  examples: [
    [
      {
        input: {
          domain: "vitalik.sol"
        },
        output: {
          status: "success",
          owner: "7nxQB...",
          message: "Successfully resolved vitalik.sol"
        },
        explanation: "Resolve a .sol domain to get the owner's wallet address"
      }
    ]
  ],
  schema: z.object({
    domain: z.string()
      .min(1)
      .describe("The .sol domain to resolve (with or without .sol suffix)")
  }),
  handler: async (agent: SolanaAgentKit, input: Record<string, any>) => {
    try {
      const domain = input.domain as string;

      if (!domain || typeof domain !== "string") {
        return {
          status: "error",
          message: "Invalid domain. Expected a non-empty string."
        };
      }

      // Remove .sol suffix if present for consistent handling
      const cleanDomain = domain.toLowerCase().endsWith(".sol") 
        ? domain.slice(0, -4) 
        : domain;

      const ownerAddress = await resolve(agent.connection, cleanDomain);

      return {
        status: "success",
        owner: ownerAddress.toBase58(),
        message: `Successfully resolved ${cleanDomain}.sol`
      };
    } catch (error: any) {
      return {
        status: "error",
        message: `Failed to resolve domain: ${error.message}`
      };
    }
  }
};

export default resolveSolDomainAction; 