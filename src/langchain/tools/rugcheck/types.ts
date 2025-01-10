import { BaseToolResponse } from "../common/types";

export interface TokenCheckResult {
  tokenProgram: string;
  tokenType: string;
  risks: Array<{
    name: string;
    level: string;
    description: string;
    score: number;
  }>;
  score: number;
}

export interface TokenReportResponse extends BaseToolResponse {
  report?: TokenCheckResult;
}
