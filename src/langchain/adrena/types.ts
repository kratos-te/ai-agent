import { BaseToolResponse } from "../common/types";

export interface PerpCloseTradeInput {
  tradeMint: string;
  price?: number;
  side: "long" | "short";
}

export interface PerpOpenTradeInput {
  collateralAmount: number;
  collateralMint?: string;
  tradeMint?: string;
  leverage?: number;
  price?: number;
  slippage?: number;
  side: "long" | "short";
}

export interface PerpTradeResponse extends BaseToolResponse {
  transaction?: string;
  price?: number;
  tradeMint?: string;
  side?: "long" | "short";
  collateralAmount?: number;
  collateralMint?: string;
  leverage?: number;
  slippage?: number;
  token?: string;
}
