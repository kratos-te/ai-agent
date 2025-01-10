import { BaseSolanaTool } from "../common/base.tool";
import { RegisterDomainInput, RegisterDomainResponse } from "./types";

export class SolanaRegisterDomainTool extends BaseSolanaTool {
  name = "solana_register_domain";
  description = `Register a .sol domain name for your wallet.

  Inputs:
  name: string, eg "pumpfun.sol" (required)
  spaceKB: number, eg 1 (optional, default is 1)`;

  protected async _call(input: string): Promise<string> {
    try {
      const params: RegisterDomainInput = JSON.parse(input);

      const tx = await this.solanaKit.registerDomain(
        params.name,
        params.spaceKB || 1,
      );

      return JSON.stringify({
        status: "success",
        message: "Domain registered successfully",
        transaction: tx,
        domain: `${params.name}.sol`,
        spaceKB: params.spaceKB || 1,
      } as RegisterDomainResponse);
    } catch (error: any) {
      return this.handleError(error);
    }
  }
}
