import { BaseSolanaTool } from "../common/base.tool";

export class SolanaTokenDataByTickerTool extends BaseSolanaTool {
  name = "solana_token_data_by_ticker";
  description = `Get the token data for a given token ticker

  Inputs: ticker is required.
  ticker: string, eg "USDC" (required)`;

  protected async _call(input: string): Promise<string> {
    try {
      const ticker = input.trim();
      const tokenData = await this.solanaKit.getTokenDataByTicker(ticker);

      return JSON.stringify({
        status: "success",
        tokenData,
      });
    } catch (error: any) {
      return this.handleError(error);
    }
  }
}
