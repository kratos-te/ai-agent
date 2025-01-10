import { BaseSolanaTool } from "../common/base";
import { StakeResponse } from "./types";

export class SolanaRestakeTool extends BaseSolanaTool {
  name = "solana_restake";
  description = `This tool can be used to restake your SOL on Solayer to receive Solayer SOL (sSOL) as a Liquid Staking Token (LST).

  Inputs:
  amount: number, eg 1 or 0.01 (required)`;

  protected async _call(input: string): Promise<string> {
    try {
      const parsedInput = JSON.parse(input) || Number(input);

      const tx = await this.solanaKit.restake(parsedInput.amount);

      return JSON.stringify({
        status: "success",
        message: "Staked successfully",
        transaction: tx,
        amount: parsedInput.amount,
      } as StakeResponse);
    } catch (error: any) {
      return this.handleError(error);
    }
  }
}
