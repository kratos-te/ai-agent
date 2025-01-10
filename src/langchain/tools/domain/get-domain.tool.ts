import { PublicKey } from "@solana/web3.js";
import { BaseSolanaTool } from "../common/base.tool";
import { DomainResponse } from "./types";

export class SolanaGetDomainTool extends BaseSolanaTool {
  name = "solana_get_domain";
  description = `Retrieve the .sol domain associated for a given account address.

  Inputs:
  account: string, eg "4Be9CvxqHW6BYiRAxW9Q3xu1ycTMWaL5z8NX4HR3ha7t" (required)`;

  protected async _call(input: string): Promise<string> {
    try {
      const account = new PublicKey(input.trim());
      const domain = await this.solanaKit.getPrimaryDomain(account);

      return JSON.stringify({
        status: "success",
        message: "Primary domain retrieved successfully",
        domain,
      } as DomainResponse);
    } catch (error: any) {
      return this.handleError(error);
    }
  }
}
