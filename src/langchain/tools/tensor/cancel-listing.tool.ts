import { PublicKey } from "@solana/web3.js";
import { BaseSolanaTool } from "../common/base.tool";
import { NFTListingResponse } from "./types";

export class SolanaCancelNFTListingTool extends BaseSolanaTool {
  name = "solana_cancel_nft_listing";
  description = `Cancel an NFT listing on Tensor Trade.

  Inputs (input is a JSON string):
  nftMint: string, the mint address of the NFT (required)`;

  protected async _call(input: string): Promise<string> {
    try {
      const params = JSON.parse(input);

      const tx = await this.solanaKit.tensorCancelListing(
        new PublicKey(params.nftMint),
      );

      return JSON.stringify({
        status: "success",
        message: "NFT listing cancelled successfully",
        transaction: tx,
        nftMint: params.nftMint,
      } as NFTListingResponse);
    } catch (error: any) {
      return this.handleError(error);
    }
  }
}
