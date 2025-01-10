import { PublicKey } from "@solana/web3.js";
import { BaseSolanaTool } from "../common/base.tool";
import { PerpTradeResponse } from "./types";

export class SolanaPerpCloseTradeTool extends BaseSolanaTool {
  name = "solana_close_perp_trade";
  description = `This tool can be used to close perpetuals trade ( It uses Adrena Protocol ).

  Inputs ( input is a JSON string ):
  tradeMint: string, eg "J1toso1uCk3RLmjorhTtrVwY9HJ7X8V9yYac6Y7kGCPn", "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263" etc. (optional)
  price?: number, eg 100 (optional)
  side: string, eg: "long" or "short"`;

  protected async _call(input: string): Promise<string> {
    try {
      const params = JSON.parse(input);

      const tx =
        params.side === "long"
          ? await this.solanaKit.closePerpTradeLong({
              price: params.price,
              tradeMint: new PublicKey(params.tradeMint),
            })
          : await this.solanaKit.closePerpTradeShort({
              price: params.price,
              tradeMint: new PublicKey(params.tradeMint),
            });

      return JSON.stringify({
        status: "success",
        message: "Perpetual trade closed successfully",
        transaction: tx,
        ...params,
      } as PerpTradeResponse);
    } catch (error: any) {
      return this.handleError(error);
    }
  }
}
