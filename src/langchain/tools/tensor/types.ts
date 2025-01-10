import { BaseToolResponse } from "../common/types";

export interface ListNFTInput {
  nftMint: string;
  price: number;
}

export interface MintNFTResponse extends BaseToolResponse {
  mintAddress?: string;
  metadata?: {
    name: string;
    symbol?: string;
    uri: string;
  };
  recipient?: string;
}

export interface NFTListingResponse extends BaseToolResponse {
  transaction?: string;
  price?: number;
  nftMint?: string;
}
