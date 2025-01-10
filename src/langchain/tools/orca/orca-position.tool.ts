import { PublicKey } from "@solana/web3.js";
import { BaseSolanaTool } from "../common/base.tool";
import { OrcaPositionInput, LiquidityResponse } from "./types";

export class SolanaOrcaClosePosition extends BaseSolanaTool {
  name = "orca_close_position";
  description = `Closes an existing liquidity position in an Orca Whirlpool. This function fetches the position
  details using the provided mint address and closes the position with a 1% slippage.

  Inputs (JSON string):
  - positionMintAddress: string, the address of the position mint that represents the liquidity position.`;

  async _call(input: string): Promise<string> {
    try {
      const params: OrcaPositionInput = JSON.parse(input);
      const txId = await this.solanaKit.orcaClosePosition(
        new PublicKey(params.positionMintAddress),
      );

      return JSON.stringify({
        status: "success",
        message: "Liquidity position closed successfully.",
        transaction: txId,
      } as LiquidityResponse);
    } catch (error: any) {
      return this.handleError(error);
    }
  }
}
