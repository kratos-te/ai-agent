import { BaseToolResponse } from "../common/types";

export interface OrcaClmmInput {
  mintDeploy: string;
  mintPair: string;
  initialPrice: number | string;
  feeTier: string;
}

export interface OrcaSingleSidedInput {
  depositTokenAmount: number;
  depositTokenMint: string;
  otherTokenMint: string;
  initialPrice: number | string;
  maxPrice: number | string;
  feeTier: string;
}

export interface OrcaPositionInput {
  positionMintAddress: string;
}

export interface OrcaCenteredPositionInput {
  whirlpoolAddress: string;
  priceOffsetBps: number;
  inputTokenMint: string;
  inputAmount: number | string;
}

export interface OrcaSingleSidedPositionInput {
  whirlpoolAddress: string;
  distanceFromCurrentPriceBps: number;
  widthBps: number;
  inputTokenMint: string;
  inputAmount: number | string;
}

export interface LiquidityResponse extends BaseToolResponse {
  transaction?: string;
}

export interface OrcaPositionsResponse extends BaseToolResponse {
  positions?: Record<
    string,
    {
      whirlpoolAddress: string;
      positionInRange: boolean;
      distanceFromCenterBps: number;
    }
  >;
}
