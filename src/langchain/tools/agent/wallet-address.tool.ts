import { BaseSolanaTool } from "../common/base.tool";
import { WalletAddressResponse } from "./types";

export class SolanaGetWalletAddressTool extends BaseSolanaTool {
  name = "solana_get_wallet_address";
  description = "Get the wallet address of the agent";

  async _call(_input: string): Promise<string> {
    return JSON.stringify({
      status: "success",
      message: "Wallet address retrieved successfully",
      address: this.solanaKit.wallet_address.toString(),
    } as WalletAddressResponse);
  }
}
