import { BaseToolResponse } from "../common/types";

export interface LendAssetInput {
  amount: number;
}

export interface LendAssetResponse extends BaseToolResponse {
  transaction?: string;
  amount?: number;
}
