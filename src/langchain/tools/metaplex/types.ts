import { BaseToolResponse } from "../common/types";

export interface DeployCollectionInput {
  name: string;
  uri: string;
  royaltyBasisPoints?: number;
  creators?: Array<{
    address: string;
    percentage: number;
  }>;
}

export interface MintNFTInput {
  collectionMint: string;
  name: string;
  uri: string;
  recipient?: string;
}

export interface DeployCollectionResponse extends BaseToolResponse {
  collectionAddress?: string;
  name?: string;
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
