import { BaseToolResponse } from "../common/types";

export interface FetchPriceInput {
  tokenId: string;
}

export interface PriceResponse extends BaseToolResponse {
  tokenId?: string;
  priceInUSDC?: string;
}

export interface StakeInput {
  amount: number;
}

export interface StakeResponse extends BaseToolResponse {
  transaction?: string;
  amount?: number;
}
