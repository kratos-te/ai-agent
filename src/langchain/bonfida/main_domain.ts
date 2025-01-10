import { PublicKey } from "@solana/web3.js";
import { BaseSolanaTool } from "../common/base";
import { DomainResponse } from "./types";

export class SolanaGetMainDomain extends BaseSolanaTool {
  name = "solana_get_main_domain";
  description = `Get the main/favorite domain for a given wallet address.

  Inputs:
  owner: string, eg "4Be9CvxqHW6BYiRAxW9Q3xu1ycTMWaL5z8NX4HR3ha7t" (required)`;

  protected async _call(input: string): Promise<string> {
    try {
      const ownerPubkey = new PublicKey(input.trim());
      const mainDomain =
        await this.solanaKit.getMainAllDomainsDomain(ownerPubkey);

      return JSON.stringify({
        status: "success",
        message: "Main domain fetched successfully",
        domain: mainDomain,
      } as DomainResponse);
    } catch (error: any) {
      return this.handleError(error);
    }
  }
}
