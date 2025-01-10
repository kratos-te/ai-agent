import { BaseToolResponse } from "../common/types";

export interface PythFetchPriceInput {
  tokenSymbol: string;
}

export interface PythPriceResponse extends BaseToolResponse {
  tokenSymbol?: string;
  priceFeedID?: string;
  price?: string;
}
