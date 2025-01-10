import { BaseToolResponse } from "../common/types";

export interface BalanceToolInput {
  tokenAddress?: string;
}

export interface BalanceToolResponse extends BaseToolResponse {
  balance?: number;
  token?: string;
}

export interface BalanceOtherToolInput {
  walletAddress: string;
  tokenAddress?: string;
}

export interface BalanceOtherToolResponse extends BaseToolResponse {
  balance?: number;
  wallet?: string;
  token?: string;
}
