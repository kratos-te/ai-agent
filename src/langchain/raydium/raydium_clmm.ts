import { PublicKey } from "@solana/web3.js";
import { BN } from "@coral-xyz/anchor";
import { Decimal } from "decimal.js";
import { BaseSolanaTool } from "../common/base";
import { RaydiumClmmInput } from "./types";

export class SolanaRaydiumCreateClmm extends BaseSolanaTool {
  name = "raydium_create_clmm";
  description = `Concentrated liquidity market maker, custom liquidity ranges, increased capital efficiency

  Inputs (input is a json string):
  mint1: string (required)
  mint2: string (required)
  configId: string (required) stores pool info, id, index, protocolFeeRate, tradeFeeRate, tickSpacing, fundFeeRate
  initialPrice: number, eg: 123.12 (required)
  startTime: number(seconds), eg: now number or zero (required)`;

  protected async _call(input: string): Promise<string> {
    try {
      const params: RaydiumClmmInput = JSON.parse(input);

      const tx = await this.solanaKit.raydiumCreateClmm(
        new PublicKey(params.mint1),
        new PublicKey(params.mint2),
        new PublicKey(params.configId),
        new Decimal(params.initialPrice),
        new BN(params.startTime),
      );

      return JSON.stringify({
        status: "success",
        message: "Raydium clmm pool created successfully",
        transaction: tx,
      });
    } catch (error: any) {
      return this.handleError(error);
    }
  }
}
