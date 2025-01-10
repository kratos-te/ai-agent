import { BaseSolanaTool } from "../common/base";
import { CreateGibworkTaskInput, GibworkTaskResponse } from "./types";

export class SolanaCreateGibworkTask extends BaseSolanaTool {
  name = "create_gibwork_task";
  description = `Create a task on Gibwork.

  Inputs (input is a JSON string):
  title: string, title of the task (required)
  content: string, description of the task (required)
  requirements: string, requirements to complete the task (required)
  tags: string[], list of tags associated with the task (required)
  payer: string, payer address (optional, defaults to agent wallet)
  tokenMintAddress: string, the mint address of the token, e.g., "JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN" (required)
  amount: number, payment amount (required)`;

  protected async _call(input: string): Promise<string> {
    try {
      const params: CreateGibworkTaskInput = JSON.parse(input);

      const taskData = await this.solanaKit.createGibworkTask(
        params.title,
        params.content,
        params.requirements,
        params.tags,
        params.tokenMintAddress,
        params.amount,
        params.payer,
      );

      return JSON.stringify({
        status: "success",
        taskId: taskData.taskId,
        signature: taskData.signature,
        message: `Task "${params.title}" created successfully`,
      } as GibworkTaskResponse);
    } catch (error: any) {
      return this.handleError(error);
    }
  }
}
