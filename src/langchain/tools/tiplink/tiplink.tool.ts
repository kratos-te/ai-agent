import { PublicKey } from "@solana/web3.js";
import { BaseSolanaTool } from "../common/base.tool";
import { TipLinkInput, TipLinkResponse } from "./types";

export class SolanaTipLinkTool extends BaseSolanaTool {
  name = "solana_tiplink";
  description = `Create a TipLink for transferring SOL or SPL tokens.
  Input is a JSON string with:
  - amount: number (required) - Amount to transfer
  - splmintAddress: string (optional) - SPL token mint address`;

  protected async _call(input: string): Promise<string> {
    try {
      const params: TipLinkInput = JSON.parse(input);

      if (!params.amount) {
        throw new Error("Amount is required");
      }

      const amount = parseFloat(params.amount.toString());
      const splmintAddress = params.splmintAddress
        ? new PublicKey(params.splmintAddress)
        : undefined;

      const { url, signature } = await this.solanaKit.createTiplink(
        amount,
        splmintAddress,
      );

      return JSON.stringify({
        status: "success",
        message: "TipLink created successfully",
        url,
        signature,
        amount,
        tokenType: splmintAddress ? "SPL" : "SOL",
      } as TipLinkResponse);
    } catch (error: any) {
      return this.handleError(error);
    }
  }
}
