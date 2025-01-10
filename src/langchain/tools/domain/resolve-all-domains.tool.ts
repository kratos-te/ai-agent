import { BaseSolanaTool } from "../common/base.tool";
import { ResolveDomainResponse } from "./types";

export class SolanaResolveAllDomainsTool extends BaseSolanaTool {
  name = "solana_resolve_all_domains";
  description = `Resolve domain names to a public key for ALL domain types EXCEPT .sol domains.
  Use this for domains like .blink, .bonk, etc.
  DO NOT use this for .sol domains (use solana_resolve_domain instead).

  Input:
  domain: string, eg "mydomain.blink" or "mydomain.bonk" (required)`;

  protected async _call(input: string): Promise<string> {
    try {
      const owner = await this.solanaKit.resolveAllDomains(input);

      if (!owner) {
        return JSON.stringify({
          status: "error",
          message: "Domain not found",
          code: "DOMAIN_NOT_FOUND",
        } as ResolveDomainResponse);
      }

      return JSON.stringify({
        status: "success",
        message: "Domain resolved successfully",
        owner: owner?.toString(),
      } as ResolveDomainResponse);
    } catch (error: any) {
      return this.handleError(error);
    }
  }
}
