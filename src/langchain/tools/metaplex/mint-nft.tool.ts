import { PublicKey } from "@solana/web3.js";
import { BaseSolanaTool } from "../common/base.tool";
import { MintNFTInput, MintNFTResponse } from "./types";

export class SolanaMintNFTTool extends BaseSolanaTool {
  name = "solana_mint_nft";
  description = `Mint a new NFT in a collection on Solana blockchain.

    Inputs (input is a JSON string):
    collectionMint: string, eg "J1S9H3QjnRtBbbuD4HjPV6RpRhwuk4zKbxsnCHuTgh9w" (required) - The address of the collection to mint into
    name: string, eg "My NFT" (required)
    uri: string, eg "https://example.com/nft.json" (required)
    recipient?: string, eg "9aUn5swQzUTRanaaTwmszxiv89cvFwUCjEBv1vZCoT1u" (optional) - The wallet to receive the NFT, defaults to agent's wallet`;

  protected async _call(input: string): Promise<string> {
    try {
      const params: MintNFTInput = JSON.parse(input);

      const result = await this.solanaKit.mintNFT(
        new PublicKey(params.collectionMint),
        {
          name: params.name,
          uri: params.uri,
        },
        params.recipient
          ? new PublicKey(params.recipient)
          : this.solanaKit.wallet_address,
      );

      return JSON.stringify({
        status: "success",
        message: "NFT minted successfully",
        mintAddress: result.mint.toString(),
        metadata: {
          name: params.name,
          uri: params.uri,
        },
        recipient: params.recipient || result.mint.toString(),
      } as MintNFTResponse);
    } catch (error: any) {
      return this.handleError(error);
    }
  }
}
