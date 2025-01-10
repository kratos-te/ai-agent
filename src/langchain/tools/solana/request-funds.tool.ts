import { BaseSolanaTool } from "../common/base.tool";
import { BaseToolResponse } from "../common/types";

export class SolanaRequestFundsTool extends BaseSolanaTool {
  name = "solana_request_funds";
  description = "Request SOL from Solana faucet (devnet/testnet only)";

  protected async _call(_input: string): Promise<string> {
    try {
      await this.solanaKit.requestFaucetFunds();

      return JSON.stringify({
        status: "success",
        message: "Successfully requested faucet funds",
        network: this.solanaKit.connection.rpcEndpoint.split("/")[2],
      } as BaseToolResponse);
    } catch (error: any) {
      return this.handleError(error);
    }
  }
}
