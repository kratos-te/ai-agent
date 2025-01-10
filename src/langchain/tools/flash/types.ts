import { BaseToolResponse } from "../common/types";

export interface FlashOpenTradeInput {
  token: string;
  type: "long" | "short";
  collateral: number;
  leverage: number;
}

export interface FlashCloseTradeInput {
  token: string;
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
