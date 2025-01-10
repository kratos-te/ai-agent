import { PublicKey } from "@solana/web3.js";
import { BaseSolanaTool } from "../common/base.tool";
import { ListNFTInput, NFTListingResponse } from "./types";

export class SolanaListNFTForSaleTool extends BaseSolanaTool {
  name = "solana_list_nft_for_sale";
  description = `List an NFT for sale on Tensor Trade.

  Inputs (input is a JSON string):
  nftMint: string, the mint address of the NFT (required)
  price: number, price in SOL (required)`;

  protected async _call(input: string): Promise<string> {
    try {
      const params: ListNFTInput = JSON.parse(input);

      // Validate NFT ownership
      const nftAccount =
        await this.solanaKit.connection.getTokenAccountsByOwner(
          this.solanaKit.wallet_address,
          { mint: new PublicKey(params.nftMint) },
        );

      if (nftAccount.value.length === 0) {
        return JSON.stringify({
          status: "error",
          message:
            "NFT not found in wallet. Please make sure you own this NFT.",
          code: "NFT_NOT_FOUND",
        } as NFTListingResponse);
      }

      const tx = await this.solanaKit.tensorListNFT(
        new PublicKey(params.nftMint),
        params.price,
      );

      return JSON.stringify({
        status: "success",
        message: "NFT listed for sale successfully",
        transaction: tx,
        price: params.price,
        nftMint: params.nftMint,
      } as NFTListingResponse);
    } catch (error: any) {
      return this.handleError(error);
    }
  }
}
