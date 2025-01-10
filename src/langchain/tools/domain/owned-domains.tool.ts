import { PublicKey } from "@solana/web3.js";
import { BaseSolanaTool } from "../common/base.tool";
import { DomainsListResponse } from "./types";

export class SolanaGetOwnedDomains extends BaseSolanaTool {
  name = "solana_get_owned_domains";
  description = `Get all domains owned by a specific wallet address.

  Inputs:
  owner: string, eg "4Be9CvxqHW6BYiRAxW9Q3xu1ycTMWaL5z8NX4HR3ha7t" (required)`;

  protected async _call(input: string): Promise<string> {
    try {
      const ownerPubkey = new PublicKey(input.trim());
      const domains = await this.solanaKit.getOwnedAllDomains(ownerPubkey);

      return JSON.stringify({
        status: "success",
        message: "Owned domains fetched successfully",
        domains,
      } as DomainsListResponse);
    } catch (error: any) {
      return this.handleError(error);
    }
  }
}
