import { BaseToolResponse } from "../common/types";

export interface TipLinkInput {
  amount: number;
  splmintAddress?: string;
}

export interface TipLinkResponse extends BaseToolResponse {
  url?: string;
  signature?: string;
  amount?: number;
  tokenType?: "SOL" | "SPL";
}
