import { PublicKey } from "@solana/web3.js";
import { Decimal } from "decimal.js";
import { BaseSolanaTool } from "../common/base.tool";
import { LiquidityResponse } from "./types";
import { FEE_TIERS } from "../../../tools/orca";

export class SolanaOrcaCreateSingleSidedPool extends BaseSolanaTool {
  name = "orca_create_single_sided_liquidity_pool";
  description = `Create a single-sided liquidity pool on Orca, the most efficient and capital-optimized CLMM platform on Solana.

  This function initializes a single-sided liquidity pool, ideal for community driven project, fair launches, and fundraising. Minimize price impact by setting a narrow price range.

  Inputs (JSON string):
  - depositTokenAmount: number, in units of the deposit token including decimals, e.g., 1000000000 (required).
  - depositTokenMint: string, mint address of the deposit token, e.g., "DepositTokenMintAddress" (required).
  - otherTokenMint: string, mint address of the other token, e.g., "OtherTokenMintAddress" (required).
  - initialPrice: number, initial price of the deposit token in terms of the other token, e.g., 0.001 (required).
  - maxPrice: number, maximum price at which liquidity is added, e.g., 5.0 (required).
  - feeTier: number, fee tier for the pool in bps. Options: 1, 2, 4, 5, 16, 30, 65, 100, 200 (required).`;

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
      const txId = await this.solanaKit.orcaCreateSingleSidedLiquidityPool(
        params.depositTokenAmount,
        new PublicKey(params.depositTokenMint),
        new PublicKey(params.otherTokenMint),
        new Decimal(params.initialPrice),
        new Decimal(params.maxPrice),
        feeTier,
      );

      return JSON.stringify({
        status: "success",
        message: "Single-sided Whirlpool created successfully",
        transaction: txId,
      } as LiquidityResponse);
    } catch (error: any) {
      return this.handleError(error);
    }
  }
}
