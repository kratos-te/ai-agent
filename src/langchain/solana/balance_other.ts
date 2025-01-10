import { PublicKey } from "@solana/web3.js";
import { BaseSolanaTool } from "../common/base";

export class SolanaBalanceOtherTool extends BaseSolanaTool {
  name = "solana_balance_other";
  description = `Get the balance of a Solana wallet or token account which is different from the agent's wallet.

  If no tokenAddress is provided, the SOL balance of the wallet will be returned.

  Inputs ( input is a JSON string ):
  walletAddress: string, eg "GDEkQF7UMr7RLv1KQKMtm8E2w3iafxJLtyXu3HVQZnME" (required)
  tokenAddress: string, eg "SENDdRQtYMWaQrBroBrJ2Q53fgVuq95CV9UPGEvpCxa" (optional)`;

  protected async _call(input: string): Promise<string> {
    try {
      const params = JSON.parse(input);
      const tokenPubKey = params.tokenAddress
        ? new PublicKey(params.tokenAddress)
        : undefined;

      const balance = await this.solanaKit.getBalanceOther(
        new PublicKey(params.walletAddress),
        tokenPubKey,
      );

      return JSON.stringify({
        status: "success",
        balance,
        wallet: params.walletAddress,
        token: params.tokenAddress || "SOL",
      });
    } catch (error: any) {
      return this.handleError(error);
    }
  }
}
