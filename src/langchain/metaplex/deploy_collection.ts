import { BaseSolanaTool } from "../common/base";
import { DeployCollectionInput, DeployCollectionResponse } from "./types";

export class SolanaDeployCollectionTool extends BaseSolanaTool {
  name = "solana_deploy_collection";
  description = `Deploy a new NFT collection on Solana blockchain.

  Inputs (input is a JSON string):
  name: string, eg "My Collection" (required)
  uri: string, eg "https://example.com/collection.json" (required)
  royaltyBasisPoints?: number, eg 500 for 5% (optional)
  creators?: Array of { address: string, percentage: number } (optional)`;

  protected async _call(input: string): Promise<string> {
    try {
      const params: DeployCollectionInput = JSON.parse(input);

      const result = await this.solanaKit.deployCollection(params);

      return JSON.stringify({
        status: "success",
        message: "Collection deployed successfully",
        collectionAddress: result.collectionAddress.toString(),
        name: params.name,
      } as DeployCollectionResponse);
    } catch (error: any) {
      return this.handleError(error);
    }
  }
}
