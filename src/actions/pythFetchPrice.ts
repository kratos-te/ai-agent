import { Action } from "../types/action";
import { SolanaAgentKit } from "../agent";
import { z } from "zod";
import { PriceServiceConnection } from "@pythnetwork/price-service-client";
import BN from "bn.js";

const pythFetchPriceAction: Action = {
  name: "solana_pyth_fetch_price",
  similes: [
    "get pyth price",
    "check pyth price",
    "pyth oracle price",
    "fetch from pyth",
    "pyth price feed",
    "oracle price"
  ],
  description: "Fetch the current price from a Pyth oracle price feed",
  examples: [
    [
      {
        input: {
          priceFeedId: "Gnt27xtC473ZT2Mw5u8wZ68Z3gULkSTb5DuxJy7eJotD"  // SOL/USD price feed
        },
        output: {
          status: "success",
          price: "23.45",
          message: "Current price: $23.45"
        },
        explanation: "Get the current SOL/USD price from Pyth oracle"
      }
    ]
  ],
  schema: z.object({
    priceFeedId: z.string()
      .min(1)
      .describe("The Pyth price feed ID to fetch the price from")
  }),
  handler: async (_agent: SolanaAgentKit, input: Record<string, any>) => {
    try {
      const priceFeedId = input.priceFeedId as string;

      // Connect to Hermes service
      const stableHermesServiceUrl = "https://hermes.pyth.network";
      const connection = new PriceServiceConnection(stableHermesServiceUrl);
      const feeds = [priceFeedId];

      const currentPrice = await connection.getLatestPriceFeeds(feeds);

      if (!currentPrice || currentPrice.length === 0) {
        return {
          status: "error",
          message: "Price data not available for the given feed ID"
        };
      }

      // Get price and exponent from price feed
      const price = new BN(currentPrice[0].getPriceUnchecked().price);
      const exponent = new BN(currentPrice[0].getPriceUnchecked().expo);

      // Convert to scaled price
      const scaledPrice = price.div(new BN(10).pow(exponent));
      const priceStr = scaledPrice.toString();

      return {
        status: "success",
        price: priceStr,
        message: `Current price: $${priceStr}`
      };
    } catch (error: any) {
      return {
        status: "error",
        message: `Failed to fetch price from Pyth: ${error.message}`
      };
    }
  }
};

export default pythFetchPriceAction; 