import { BaseSolanaTool } from "../common/base.tool";
import { DomainsListResponse } from "./types";

export class SolanaGetOwnedTldDomains extends BaseSolanaTool {
  name = "solana_get_owned_tld_domains";
  description = `Get all domains owned by the agent's wallet for a specific TLD.

  Inputs:
  tld: string, eg "bonk" (required)`;

  protected async _call(input: string): Promise<string> {
    try {
      const domains = await this.solanaKit.getOwnedDomainsForTLD(input);

      return JSON.stringify({
        status: "success",
        message: "TLD domains fetched successfully",
        domains,
      } as DomainsListResponse);
    } catch (error: any) {
      return this.handleError(error);
    }
  }
}
