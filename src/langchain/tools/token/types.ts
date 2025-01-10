import { BaseToolResponse } from "../common/types";

export interface DeployTokenInput {
  name: string;
  uri: string;
  symbol: string;
  decimals?: number;
  initialSupply?: number;
}

export interface DeployTokenResponse extends BaseToolResponse {
  mintAddress?: string;
  decimals?: number;
}

export interface CompressedAirdropInput {
  mintAddress: string;
  amount: number;
  decimals: number;
  recipients: string[];
  priorityFeeInLamports?: number;
  shouldLog?: boolean;
}

export interface CompressedAirdropResponse extends BaseToolResponse {
  transactionHashes?: string[];
}

export interface CloseEmptyAccountsResponse extends BaseToolResponse {
  signature?: string;
  size?: number;
}

export interface TransferToolInput {
  to: string;
  amount: number;
  mint?: string;
}

export interface TransferToolResponse extends BaseToolResponse {
  amount?: number;
  recipient?: string;
  token?: string;
  transaction?: string;
}
