import { BaseSolanaTool } from "../common";
import { PublicKey } from "@solana/web3.js";

export class SolanaTradeTool extends BaseSolanaTool {
  name = "solana_trade";
  description = `This tool can be used to swap tokens to another token ( It uses Jupiter Exchange ).
  
    Inputs ( input is a JSON string ):
    outputMint: string, eg "So11111111111111111111111111111111111111112" or "SENDdRQtYMWaQrBroBrJ2Q53fgVuq95CV9UPGEvpCxa" (required)
    inputAmount: number, eg 1 or 0.01 (required)
    inputMint?: string, eg "So11111111111111111111111111111111111111112" (optional)
    slippageBps?: number, eg 100 (optional)`;

  protected async _call(input: string): Promise<string> {
    try {
      const parsedInput = JSON.parse(input);

      const tx = await this.solanaKit.trade(
        new PublicKey(parsedInput.outputMint),
        parsedInput.inputAmount,
        parsedInput.inputMint
          ? new PublicKey(parsedInput.inputMint)
          : new PublicKey("So11111111111111111111111111111111111111112"),
        parsedInput.slippageBps,
      );

      return JSON.stringify({
        status: "success",
        message: "Trade executed successfully",
        transaction: tx,
        inputAmount: parsedInput.inputAmount,
        inputToken: parsedInput.inputMint || "SOL",
        outputToken: parsedInput.outputMint,
      });
    } catch (error: any) {
      return this.handleError(error);
    }
  }
}
