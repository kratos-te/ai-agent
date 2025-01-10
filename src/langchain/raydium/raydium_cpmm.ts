import { PublicKey } from "@solana/web3.js";
import { BN } from "@coral-xyz/anchor";
import { BaseSolanaTool } from "../common/base";
import { RaydiumCpmmInput } from "./types";

export class SolanaRaydiumCreateCpmm extends BaseSolanaTool {
  name = "raydium_create_cpmm";
  description = `Raydium's newest CPMM, does not require marketID, supports Token 2022 standard

  Inputs (input is a json string):
  mint1: string (required)
  mint2: string (required)
  configId: string (required), stores pool info, index, protocolFeeRate, tradeFeeRate, fundFeeRate, createPoolFee
  mintAAmount: number(int), eg: 1111 (required)
  mintBAmount: number(int), eg: 2222 (required)
  startTime: number(seconds), eg: now number or zero (required)`;

  protected async _call(input: string): Promise<string> {
    try {
      const params: RaydiumCpmmInput = JSON.parse(input);

      const tx = await this.solanaKit.raydiumCreateCpmm(
        new PublicKey(params.mint1),
        new PublicKey(params.mint2),
        new PublicKey(params.configId),
        new BN(params.mintAAmount),
        new BN(params.mintBAmount),
        new BN(params.startTime),
      );

      return JSON.stringify({
        status: "success",
        message: "Raydium cpmm pool created successfully",
        transaction: tx,
      });
    } catch (error: any) {
      return this.handleError(error);
    }
  }
}
