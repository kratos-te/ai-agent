import { BaseSolanaTool } from "../common/base";
import { RockPaperScissorsInput } from "./types";

export class SolanaRockPaperScissorsTool extends BaseSolanaTool {
  name = "rock_paper_scissors";
  description = `Play rock paper scissors to win SEND coins.

  Inputs (input is a JSON string):
  choice: string, either "rock", "paper", or "scissors" (required)
  amount: number, amount of SOL to play with - must be 0.1, 0.01, or 0.005 SOL (required)`;

  protected async _call(input: string): Promise<string> {
    try {
      const params: RockPaperScissorsInput = JSON.parse(input);
      const result = await this.solanaKit.rockPaperScissors(
        params.amount,
        params.choice,
      );

      return JSON.stringify({
        status: "success",
        message: result,
      });
    } catch (error: any) {
      return this.handleError(error);
    }
  }
}
