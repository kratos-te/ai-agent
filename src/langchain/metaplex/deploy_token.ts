import { BaseSolanaTool } from "../common/base";

export class SolanaDeployTokenTool extends BaseSolanaTool {
  name = "solana_deploy_token";
  description = `Deploy a new token on Solana blockchain.

  Inputs (input is a JSON string):
  name: string, eg "My Token" (required)
  uri: string, eg "https://example.com/token.json" (required)
  symbol: string, eg "MTK" (required)
  decimals?: number, eg 9 (optional, defaults to 9)
  initialSupply?: number, eg 1000000 (optional)`;

  protected async _call(input: string): Promise<string> {
    try {
      const params = JSON.parse(input);

      const result = await this.solanaKit.deployToken(
        params.name,
        params.uri,
        params.symbol,
        params.decimals,
        params.initialSupply,
      );

      return JSON.stringify({
        status: "success",
        message: "Token deployed successfully",
        mintAddress: result.mint.toString(),
        decimals: params.decimals || 9,
      });
    } catch (error: any) {
      return this.handleError(error);
    }
  }
}
