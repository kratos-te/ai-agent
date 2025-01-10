import { PublicKey } from "@solana/web3.js";
import { Decimal } from "decimal.js";
import { BaseSolanaTool } from "../common/base.tool";
import { OrcaCenteredPositionInput, LiquidityResponse } from "./types";

export class SolanaOrcaOpenCenteredPosition extends BaseSolanaTool {
  name = "orca_open_centered_position_with_liquidity";
  description = `Add liquidity to a CLMM by opening a centered position in an Orca Whirlpool, the most efficient liquidity pool on Solana.

  Inputs (JSON string):
  - whirlpoolAddress: string, address of the Orca Whirlpool (required).
  - priceOffsetBps: number, bps offset (one side) from the current pool price, e.g., 500 for 5% (required).
  - inputTokenMint: string, mint address of the deposit token (required).
  - inputAmount: number, amount of the deposit token, e.g., 100.0 (required).`;

  async _call(input: string): Promise<string> {
    try {
      const params: OrcaCenteredPositionInput = JSON.parse(input);
      const txId = await this.solanaKit.orcaOpenCenteredPositionWithLiquidity(
        new PublicKey(params.whirlpoolAddress),
        params.priceOffsetBps,
        new PublicKey(params.inputTokenMint),
        new Decimal(params.inputAmount),
      );

      return JSON.stringify({
        status: "success",
        message: "Centered liquidity position opened successfully.",
        transaction: txId,
      } as LiquidityResponse);
    } catch (error: any) {
      return this.handleError(error);
    }
  }
}
