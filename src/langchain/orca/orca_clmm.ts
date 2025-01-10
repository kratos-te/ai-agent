import { PublicKey } from "@solana/web3.js";
import { Decimal } from "decimal.js";
import { BaseSolanaTool } from "../common/base";
import { LiquidityResponse } from "./types";
import { FEE_TIERS } from "../../tools/orca";

export class SolanaOrcaCreateCLMM extends BaseSolanaTool {
  name = "orca_create_clmm";
  description = `Create a Concentrated Liquidity Market Maker (CLMM) pool on Orca, the most efficient and capital-optimized CLMM on Solana. This function initializes a CLMM pool but does not add liquidity. You can add liquidity later using a centered position or a single-sided position.

  Inputs (JSON string):
  - mintDeploy: string, the mint of the token you want to deploy (required).
  - mintPair: string, The mint of the token you want to pair the deployed mint with (required).
  - initialPrice: number, initial price of mintA in terms of mintB, e.g., 0.001 (required).
  - feeTier: number, fee tier in bps. Options: 1, 2, 4, 5, 16, 30, 65, 100, 200 (required).`;

  async _call(input: string): Promise<string> {
    try {
      const params = JSON.parse(input);
      const feeTier = params.feeTier;

      if (!feeTier || !(feeTier in FEE_TIERS)) {
        throw new Error(
          `Invalid feeTier. Available options: ${Object.keys(FEE_TIERS).join(
            ", ",
          )}`,
        );
      }
      const txId = await this.solanaKit.orcaCreateCLMM(
        new PublicKey(params.mintDeploy),
        new PublicKey(params.mintPair),
        new Decimal(params.initialPrice),
        feeTier,
      );

      return JSON.stringify({
        status: "success",
        message:
          "CLMM pool created successfully. Note: No liquidity was added.",
        transaction: txId,
      } as LiquidityResponse);
    } catch (error: any) {
      return this.handleError(error);
    }
  }
}
