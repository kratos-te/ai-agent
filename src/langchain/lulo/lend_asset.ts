import { BaseSolanaTool } from "../common/base";
import { LendAssetResponse } from "./types";

export class SolanaLendAssetTool extends BaseSolanaTool {
  name = "solana_lend_asset";
  description = `Lend idle USDC for yield using Lulo. ( only USDC is supported )

  Inputs (input is a json string):
  amount: number, eg 1, 0.01 (required)`;

  async _call(input: string): Promise<string> {
    try {
      // Parse input either as direct number or JSON object
      const amount = JSON.parse(input).amount || Number(input);

      const tx = await this.solanaKit.lendAssets(amount);

      return JSON.stringify({
        status: "success",
        message: "Asset lent successfully",
        transaction: tx,
        amount,
      } as LendAssetResponse);
    } catch (error: any) {
      return this.handleError(error);
    }
  }
}
