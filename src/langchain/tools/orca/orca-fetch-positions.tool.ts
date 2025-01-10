import { BaseSolanaTool } from "../common/base.tool";
import { OrcaPositionsResponse } from "./types";

export class SolanaOrcaFetchPositions extends BaseSolanaTool {
  name = "orca_fetch_positions";
  description = `Fetch all the liquidity positions in an Orca Whirlpool by owner. Returns an object with position mint addresses as keys and position status details as values.`;

  async _call(): Promise<string> {
    try {
      const positions = await this.solanaKit.orcaFetchPositions();

      return JSON.stringify({
        status: "success",
        message: "Liquidity positions fetched successfully",
        positions: JSON.parse(positions),
      } as OrcaPositionsResponse);
    } catch (error: any) {
      return this.handleError(error);
    }
  }
}
