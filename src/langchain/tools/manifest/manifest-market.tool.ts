import { PublicKey } from "@solana/web3.js";
import { BaseSolanaTool } from "../common/base.tool";
import { ManifestMarketInput, ManifestMarketResponse } from "./types";

export class SolanaManifestCreateMarket extends BaseSolanaTool {
  name = "solana_manifest_create_market";
  description = `Manifest market

  Inputs (input is a json string):
  baseMint: string (required)
  quoteMint: string (required)`;

  protected async _call(input: string): Promise<string> {
    try {
      const params: ManifestMarketInput = JSON.parse(input);

      const tx = await this.solanaKit.manifestCreateMarket(
        new PublicKey(params.baseMint),
        new PublicKey(params.quoteMint),
      );

      return JSON.stringify({
        status: "success",
        message: "Create manifest market successfully",
        transaction: tx[0],
        marketId: tx[1],
      } as ManifestMarketResponse);
    } catch (error: any) {
      return this.handleError(error);
    }
  }
}
