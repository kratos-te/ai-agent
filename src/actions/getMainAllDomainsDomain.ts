import { Action } from "../types/action";
import { SolanaAgentKit } from "../agent";
import { z } from "zod";
import { PublicKey } from "@solana/web3.js";
import { TldParser } from "@onsol/tldparser";

const getMainAllDomainsDomainAction: Action = {
  name: "solana_get_main_all_domains_domain",
  similes: [
    "get main domain",
    "fetch primary domain",
    "get default domain",
    "get main address name",
    "get primary name",
    "get main domain name"
  ],
  description: "Get the main domain associated with a wallet address",
  examples: [
    [
      {
        input: {
          address: "7nxQB..."
        },
        output: {
          status: "success",
          domain: "solana.sol",
          message: "Successfully retrieved main domain"
        },
        explanation: "Get the main domain name for a given wallet address"
      }
    ]
  ],
  schema: z.object({
    address: z.string()
      .min(1)
      .describe("The wallet address to get the main domain for")
  }),
  handler: async (agent: SolanaAgentKit, input: Record<string, any>) => {
    try {
      const address = new PublicKey(input.address);

      // Get the main domain using TldParser
      const parser = new TldParser(agent.connection);
      const mainDomain = await parser.getMainDomain(address);

      if (!mainDomain) {
        return {
          status: "error",
          message: "No main domain found for this address"
        };
      }

      return {
        status: "success",
        domain: mainDomain.domain,
        message: "Successfully retrieved main domain"
      };
    } catch (error: any) {
      return {
        status: "error",
        message: `Failed to get main domain: ${error.message}`
      };
    }
  }
};

export default getMainAllDomainsDomainAction; 