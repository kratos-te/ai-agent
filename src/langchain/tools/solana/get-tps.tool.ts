import { BaseSolanaTool } from "../common/base.tool";
import { TPSResponse } from "./types";

export class SolanaTPSCalculatorTool extends BaseSolanaTool {
  name = "solana_get_tps";
  description = "Get the current TPS of the Solana network";

  async _call(_input: string): Promise<string> {
    try {
      const tps = await this.solanaKit.getTPS();
      return JSON.stringify({
        status: "success",
        message: `Current network TPS: ${tps}`,
        tps,
      } as TPSResponse);
    } catch (error: any) {
      return this.handleError(error);
    }
  }
}
