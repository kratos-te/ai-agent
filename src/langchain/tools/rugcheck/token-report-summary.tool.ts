import { BaseSolanaTool } from "../common/base.tool";
import { TokenReportResponse } from "./types";

export class SolanaFetchTokenReportSummaryTool extends BaseSolanaTool {
  name = "solana_fetch_token_report_summary";
  description = `Fetches a summary report for a specific token from RugCheck.
  Inputs:
  - mint: string, the mint address of the token, e.g., "JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN" (required).`;

  protected async _call(input: string): Promise<string> {
    try {
      const mint = input.trim();
      const report = await this.solanaKit.fetchTokenReportSummary(mint);

      return JSON.stringify({
        status: "success",
        message: "Token report summary fetched successfully",
        report,
      } as TokenReportResponse);
    } catch (error: any) {
      return this.handleError(error);
    }
  }
}
