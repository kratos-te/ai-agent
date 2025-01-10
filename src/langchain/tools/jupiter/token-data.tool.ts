import { BaseSolanaTool } from "../common/base.tool";

export class SolanaTokenDataTool extends BaseSolanaTool {
  name = "solana_token_data";
  description = `Get the token data for a given token mint address

  Inputs: mintAddress is required.
  mintAddress: string, eg "So11111111111111111111111111111111111111112" (required)`;

  protected async _call(input: string): Promise<string> {
    try {
      const parsedInput = input.trim();
      const tokenData = await this.solanaKit.getTokenDataByAddress(parsedInput);

      return JSON.stringify({
        status: "success",
        tokenData,
      });
    } catch (error: any) {
      return this.handleError(error);
    }
  }
}
