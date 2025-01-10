import { PublicKey } from "@solana/web3.js";
import { Decimal } from "decimal.js";
import { BaseSolanaTool } from "../common/base";
import { OrcaSingleSidedPositionInput, LiquidityResponse } from "./types";

export class SolanaOrcaOpenSingleSidedPosition extends BaseSolanaTool {
  name = "orca_open_single_sided_position";
  description = `Add liquidity to a CLMM by opening a single-sided position in an Orca Whirlpool, the most efficient liquidity pool on Solana.

  Inputs (JSON string):
  - whirlpoolAddress: string, address of the Orca Whirlpool (required).
  - distanceFromCurrentPriceBps: number, distance in basis points from the current price (required).
  - widthBps: number, width of the position in basis points (required).
  - inputTokenMint: string, mint address of the deposit token (required).
  - inputAmount: number, amount of the deposit token, e.g., 100.0 (required).`;

  async _call(input: string): Promise<string> {
    try {
      const params: OrcaSingleSidedPositionInput = JSON.parse(input);
      const txId = await this.solanaKit.orcaOpenSingleSidedPosition(
        new PublicKey(params.whirlpoolAddress),
        params.distanceFromCurrentPriceBps,
        params.widthBps,
        new PublicKey(params.inputTokenMint),
        new Decimal(params.inputAmount),
      );

      return JSON.stringify({
        status: "success",
        message: "Single-sided liquidity position opened successfully.",
        transaction: txId,
      } as LiquidityResponse);
    } catch (error: any) {
      return this.handleError(error);
    }
  }
}
