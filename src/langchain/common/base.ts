import { Tool } from "langchain/tools";
import { SolanaAgentKit } from "../../agent";
import { BaseToolResponse } from "./types";

export abstract class BaseSolanaTool extends Tool {
  constructor(protected solanaKit: SolanaAgentKit) {
    super();
  }

  protected handleError(error: any): string {
    return JSON.stringify({
      status: "error",
      message: error.message,
      code: error.code || "UNKNOWN_ERROR",
    } as BaseToolResponse);
  }
}
