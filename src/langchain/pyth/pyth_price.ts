import { BaseSolanaTool } from "../common/base";
import { PythPriceResponse } from "./types";

export class SolanaPythFetchPrice extends BaseSolanaTool {
  name = "solana_pyth_fetch_price";
  description = `Fetch the price of a given price feed from Pyth's Hermes service

  Inputs:
  tokenSymbol: string, e.g., BTC for bitcoin`;

  async _call(input: string): Promise<string> {
    try {
      const priceFeedID = await this.solanaKit.getPythPriceFeedID(input);
      const price = await this.solanaKit.getPythPrice(priceFeedID);

      const response = {
        status: "success",
        tokenSymbol: input,
        priceFeedID,
        price,
      };

      return JSON.stringify(response);
    } catch (error: any) {
      const response: PythPriceResponse = {
        status: "error",
        tokenSymbol: input,
        message: error.message,
        code: error.code || "UNKNOWN_ERROR",
      };
      return JSON.stringify(response);
    }
  }
}
