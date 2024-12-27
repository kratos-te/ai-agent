import { Action } from "../types/action";
import { SolanaAgentKit } from "../agent";
import { z } from "zod";
import { PublicKey } from "@solana/web3.js";
import { JupiterTokenData } from "../types";

const getTokenDataAction: Action = {
  name: "solana_get_token_data",
  similes: [
    "get token info",
    "token details",
    "lookup token",
    "find token",
    "token data"
  ],
  description: "Get token data from either a token address or ticker symbol",
  examples: [
    [
      {
        input: {
          address: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"
        },
        output: {
          status: "success",
          token: {
            name: "USD Coin",
            symbol: "USDC",
            address: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
            decimals: 6
          }
        },
        explanation: "Get token data using the token's address"
      }
    ],
    [
      {
        input: {
          ticker: "SOL"
        },
        output: {
          status: "success",
          token: {
            name: "Wrapped SOL",
            symbol: "SOL",
            address: "So11111111111111111111111111111111111111112",
            decimals: 9
          }
        },
        explanation: "Get token data using the token's ticker symbol"
      }
    ]
  ],
  schema: z.object({
    address: z.string().optional().describe("The token's mint address"),
    ticker: z.string().optional().describe("The token's ticker symbol")
  }).refine(data => data.address || data.ticker, {
    message: "Either address or ticker must be provided"
  }),
  handler: async (agent: SolanaAgentKit, input: Record<string, any>) => {
    try {
      let tokenData: JupiterTokenData | undefined;

      if (input.address) {
        const mint = new PublicKey(input.address);
        const response = await fetch("https://tokens.jup.ag/tokens?tags=verified", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        const data = (await response.json()) as JupiterTokenData[];
        tokenData = data.find((token: JupiterTokenData) => token.address === mint.toBase58());
      } else if (input.ticker) {
        const response = await fetch(
          `https://api.dexscreener.com/latest/dex/search?q=${input.ticker}`
        );
        const data = await response.json();

        if (!data.pairs || data.pairs.length === 0) {
          return {
            status: "error",
            message: `No token found for ticker: ${input.ticker}`
          };
        }

        let solanaPairs = data.pairs
          .filter((pair: any) => pair.chainId === "solana")
          .sort((a: any, b: any) => (b.fdv || 0) - (a.fdv || 0))
          .filter(
            (pair: any) =>
              pair.baseToken.symbol.toLowerCase() === input.ticker.toLowerCase()
          );

        if (solanaPairs.length === 0) {
          return {
            status: "error",
            message: `No Solana token found for ticker: ${input.ticker}`
          };
        }

        const address = solanaPairs[0].baseToken.address;
        const jupResponse = await fetch("https://tokens.jup.ag/tokens?tags=verified");
        const jupData = (await jupResponse.json()) as JupiterTokenData[];
        tokenData = jupData.find((token: JupiterTokenData) => token.address === address);
      }

      if (!tokenData) {
        return {
          status: "error",
          message: "Token not found or not verified"
        };
      }

      return {
        status: "success",
        token: {
          name: tokenData.name,
          symbol: tokenData.symbol,
          address: tokenData.address,
          decimals: tokenData.decimals,
          logoURI: tokenData.logoURI
        }
      };
    } catch (error: any) {
      return {
        status: "error",
        message: `Failed to get token data: ${error.message}`
      };
    }
  }
};

export default getTokenDataAction; 