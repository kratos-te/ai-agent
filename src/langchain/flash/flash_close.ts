import { BaseSolanaTool } from "../common/base";
import { FlashCloseTradeInput, PerpTradeResponse } from "./types";

export class SolanaFlashCloseTrade extends BaseSolanaTool {
  name = "solana_flash_close_trade";
  description = `Close an existing leveraged trading position on Flash.Trade exchange.

  Inputs ( input is a JSON string ):
  token: string, eg "SOL", "BTC", "ETH" (required)
  side: string, eg "long", "short" (required)
  
  Example prompt is Close a 20x leveraged trade for SOL on long side`;

  protected async _call(input: string): Promise<string> {
    try {
      const params: FlashCloseTradeInput = JSON.parse(input);

      const tx = await this.solanaKit.flashCloseTrade({
        token: params.token,
        side: params.side,
      });

      return JSON.stringify({
        status: "success",
        message: "Flash trade position closed successfully",
        transaction: tx,
        token: params.token,
        side: params.side,
      } as PerpTradeResponse);
    } catch (error: any) {
      return this.handleError(error);
    }
  }
}
