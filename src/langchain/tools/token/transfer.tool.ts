import { PublicKey } from "@solana/web3.js";
import { BaseSolanaTool } from "../common/base.tool";
import { TransferToolInput, TransferToolResponse } from "./types";

export class SolanaTransferTool extends BaseSolanaTool {
  name = "solana_transfer";
  description = `Transfer tokens or SOL to another address ( also called as wallet address ).

  Inputs ( input is a JSON string ):
  to: string, eg "8x2dR8Mpzuz2YqyZyZjUbYWKSWesBo5jMx2Q9Y86udVk" (required)
  amount: number, eg 1 (required)
  mint?: string, eg "So11111111111111111111111111111111111111112" or "SENDdRQtYMWaQrBroBrJ2Q53fgVuq95CV9UPGEvpCxa" (optional)`;

  protected async _call(input: string): Promise<string> {
    try {
      const params: TransferToolInput = JSON.parse(input);

      const recipient = new PublicKey(params.to);
      const mintAddress = params.mint ? new PublicKey(params.mint) : undefined;

      const tx = await this.solanaKit.transfer(
        recipient,
        params.amount,
        mintAddress,
      );

      return JSON.stringify({
        status: "success",
        message: "Transfer completed successfully",
        amount: params.amount,
        recipient: params.to,
        token: params.mint || "SOL",
        transaction: tx,
      } as TransferToolResponse);
    } catch (error: any) {
      return this.handleError(error);
    }
  }
}
