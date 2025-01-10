import { BaseSolanaTool } from "../common/base.tool";
import { CloseEmptyAccountsResponse } from "./types";

export class SolanaCloseEmptyTokenAccounts extends BaseSolanaTool {
  name = "close_empty_token_accounts";
  description = `Close all empty spl-token accounts and reclaim the rent`;

  protected async _call(): Promise<string> {
    try {
      const { signature, size } =
        await this.solanaKit.closeEmptyTokenAccounts();

      return JSON.stringify({
        status: "success",
        message: `${size} accounts closed successfully. ${size === 48 ? "48 accounts can be closed in a single transaction try again to close more accounts" : ""}`,
        signature,
        size,
      } as CloseEmptyAccountsResponse);
    } catch (error: any) {
      return this.handleError(error);
    }
  }
}
