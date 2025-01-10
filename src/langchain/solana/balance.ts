import { PublicKey } from "@solana/web3.js";
import { BaseSolanaTool } from "../common/base";

export class SolanaBalanceTool extends BaseSolanaTool {
  name = "solana_balance";
  description = `Get the balance of a Solana wallet or token account.

  If you want to get the balance of your wallet, you don't need to provide the tokenAddress.
  If no tokenAddress is provided, the balance will be in SOL.

  Inputs ( input is a JSON string ):
  tokenAddress: string, eg "So11111111111111111111111111111111111111112" (optional)`;

  protected async _call(input: string): Promise<string> {
    try {
      const params = input ? JSON.parse(input) : {};
      const tokenAddress = params.tokenAddress
        ? new PublicKey(params.tokenAddress)
        : undefined;
      const balance = await this.solanaKit.getBalance(tokenAddress);

      return JSON.stringify({
        status: "success",
        balance,
        token: params.tokenAddress || "SOL",
      });
    } catch (error: any) {
      return this.handleError(error);
    }
  }
}
