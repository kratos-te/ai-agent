import { PublicKey } from "@solana/web3.js";
import { BN } from "@coral-xyz/anchor";
import { BaseSolanaTool } from "../common/base.tool";
import { RaydiumAmmV4Input } from "./types";

export class SolanaRaydiumCreateAmmV4 extends BaseSolanaTool {
  name = "raydium_create_ammV4";
  description = `Raydium's Legacy AMM that requires an OpenBook marketID

  Inputs (input is a json string):
  marketId: string (required)
  baseAmount: number(int), eg: 111111 (required)
  quoteAmount: number(int), eg: 111111 (required)
  startTime: number(seconds), eg: now number or zero (required)`;

  protected async _call(input: string): Promise<string> {
    try {
      const params: RaydiumAmmV4Input = JSON.parse(input);

      const tx = await this.solanaKit.raydiumCreateAmmV4(
        new PublicKey(params.marketId),
        new BN(params.baseAmount),
        new BN(params.quoteAmount),
        new BN(params.startTime),
      );

      return JSON.stringify({
        status: "success",
        message: "Raydium amm v4 pool created successfully",
        transaction: tx,
      });
    } catch (error: any) {
      return this.handleError(error);
    }
  }
}
