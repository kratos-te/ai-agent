import { BaseToolResponse } from "../common/types";

export interface ManifestMarketInput {
  baseMint: string;
  quoteMint: string;
}

export interface ManifestMarketResponse extends BaseToolResponse {
  transaction: string;
  marketId: string;
}
