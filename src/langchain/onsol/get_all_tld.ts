import { BaseSolanaTool } from "../common";

export class SolanaGetAllTlds extends BaseSolanaTool {
  name = "solana_get_all_tlds";
  description = `Get all active top-level domains (TLDs) in the AllDomains Name Service`;

  async _call(): Promise<string> {
    try {
      const tlds = await this.solanaKit.getAllDomainsTLDs();

      return JSON.stringify({
        status: "success",
        message: "TLDs fetched successfully",
        tlds,
      });
    } catch (error: any) {
      return JSON.stringify({
        status: "error",
        message: error.message,
        code: error.code || "FETCH_TLDS_ERROR",
      });
    }
  }
}
