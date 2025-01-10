import { BaseSolanaTool } from "../common";
import { PublicKey } from "@solana/web3.js";

export class SolanaCancelAllOrdersTool extends BaseSolanaTool {
  name = "solana_cancel_all_orders";
  description = `This tool can be used to cancel all orders from a Manifest market.
  
    Input ( input is a JSON string ):
    marketId: string, eg "ENhU8LsaR7vDD2G1CsWcsuSGNrih9Cv5WZEk7q9kPapQ" for SOL/USDC (required)`;

  protected async _call(input: string): Promise<string> {
    try {
      const marketId = new PublicKey(input.trim());
      const tx = await this.solanaKit.cancelAllOrders(marketId);

      return JSON.stringify({
        status: "success",
        message: "Cancel orders successfully",
        transaction: tx,
        marketId,
      });
    } catch (error: any) {
      return this.handleError(error);
    }
  }
}
