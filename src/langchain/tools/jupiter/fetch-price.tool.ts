import { BaseSolanaTool } from "../common/base.tool";
import { PriceResponse } from "./types";

export class SolanaFetchPriceTool extends BaseSolanaTool {
  name = "solana_fetch_price";
  description = `Fetch the price of a given token in USDC.

  Inputs:
  - tokenId: string, the mint address of the token, e.g., "JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN"`;

  async _call(input: string): Promise<string> {
    try {
      const price = await this.solanaKit.fetchTokenPrice(input.trim());
      return JSON.stringify({
        status: "success",
        tokenId: input.trim(),
        priceInUSDC: price,
      } as PriceResponse);
    } catch (error: any) {
      return this.handleError(error);
    }
  }
}
