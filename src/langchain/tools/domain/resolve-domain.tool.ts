import { BaseSolanaTool } from "../common/base.tool";
import { ResolveDomainResponse } from "./types";

export class SolanaResolveDomainTool extends BaseSolanaTool {
  name = "solana_resolve_domain";
  description = `Resolve ONLY .sol domain names to a Solana PublicKey.
  This tool is exclusively for .sol domains.
  DO NOT use this for other domain types like .blink, .bonk, etc.

  Inputs:
  domain: string, eg "pumpfun.sol" (required)`;

  protected async _call(input: string): Promise<string> {
    try {
      const domain = input.trim();
      const publicKey = await this.solanaKit.resolveSolDomain(domain);

      return JSON.stringify({
        status: "success",
        message: "Domain resolved successfully",
        publicKey: publicKey.toBase58(),
      } as ResolveDomainResponse);
    } catch (error: any) {
      return this.handleError(error);
    }
  }
}
