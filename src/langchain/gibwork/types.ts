import { BaseToolResponse } from "../common/types";

export interface CreateGibworkTaskInput {
  title: string;
  content: string;
  requirements: string;
  tags: string[];
  tokenMintAddress: string;
  amount: number;
  payer?: string;
}

export interface GibworkTaskResponse extends BaseToolResponse {
  taskId?: string;
  signature?: string;
}
