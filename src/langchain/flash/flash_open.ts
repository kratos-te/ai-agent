import { BaseSolanaTool } from "../common/base";
import { FlashOpenTradeInput, PerpTradeResponse } from "./types";

export class SolanaFlashOpenTrade extends BaseSolanaTool {
  name = "solana_flash_open_trade";
  description = `This tool can be used to open a new leveraged trading position on Flash.Trade exchange.

  Inputs ( input is a JSON string ):
  token: string, eg "SOL", "BTC", "ETH" (required)
  type: string, eg "long", "short" (required) 
  collateral: number, eg 10, 100, 1000 (required) 
  leverage: number, eg 5, 10, 20 (required)
  
  Example prompt is Open a 20x leveraged trade for SOL on long side using flash trade with 500 USD as collateral`;

  protected async _call(input: string): Promise<string> {
    try {
      const params: FlashOpenTradeInput = JSON.parse(input);

      const tx = await this.solanaKit.flashOpenTrade({
        token: params.token,
        side: params.type,
        collateralUsd: params.collateral,
        leverage: params.leverage,
      });

      return JSON.stringify({
        status: "success",
        message: "Flash trade position opened successfully",
        transaction: tx,
        token: params.token,
        side: params.type,
        collateralAmount: params.collateral,
        leverage: params.leverage,
      } as PerpTradeResponse);
    } catch (error: any) {
      return this.handleError(error);
    }
  }
}
