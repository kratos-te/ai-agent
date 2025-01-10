import { PublicKey } from "@solana/web3.js";
import { BaseSolanaTool } from "../common/base.tool";
import { OpenbookMarketInput } from "./types";

export class SolanaOpenbookCreateMarket extends BaseSolanaTool {
  name = "solana_openbook_create_market";
  description = `Openbook marketId, required for ammv4

  Inputs (input is a json string):
  baseMint: string (required)
  quoteMint: string (required)
  lotSize: number (required)
  tickSize: number (required)`;

  protected async _call(input: string): Promise<string> {
    try {
      const params: OpenbookMarketInput = JSON.parse(input);

      const tx = await this.solanaKit.openbookCreateMarket(
        new PublicKey(params.baseMint),
        new PublicKey(params.quoteMint),
        params.lotSize,
        params.tickSize,
      );

      return JSON.stringify({
        status: "success",
        message: "Openbook market created successfully",
        transaction: tx,
      });
    } catch (error: any) {
      return this.handleError(error);
    }
  }
}
