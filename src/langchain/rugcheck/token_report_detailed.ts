import { BaseSolanaTool } from "../common/base";
import { TokenReportResponse } from "./types";

export class SolanaFetchTokenDetailedReportTool extends BaseSolanaTool {
  name = "solana_fetch_token_detailed_report";
  description = `Fetches a detailed report for a specific token from RugCheck.
  Inputs:
  - mint: string, the mint address of the token, e.g., "JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN" (required).`;

  protected async _call(input: string): Promise<string> {
    try {
      const mint = input.trim();
      const detailedReport =
        await this.solanaKit.fetchTokenDetailedReport(mint);

      return JSON.stringify({
        status: "success",
        message: "Detailed token report fetched successfully",
        report: detailedReport,
      } as TokenReportResponse);
    } catch (error: any) {
      return this.handleError(error);
    }
  }
}
