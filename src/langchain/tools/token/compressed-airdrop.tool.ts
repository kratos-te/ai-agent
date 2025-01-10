import { BaseSolanaTool } from "../common/base.tool";
import { CompressedAirdropInput, CompressedAirdropResponse } from "./types";

export class SolanaCompressedAirdropTool extends BaseSolanaTool {
  name = "solana_compressed_airdrop";
  description = `Airdrop SPL tokens with ZK Compression (also called as airdropping tokens)

  Inputs (input is a JSON string):
  mintAddress: string, the mint address of the token, e.g., "JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN" (required)
  amount: number, the amount of tokens to airdrop per recipient, e.g., 42 (required)
  decimals: number, the decimals of the token, e.g., 6 (required)
  recipients: string[], the recipient addresses, e.g., ["1nc1nerator11111111111111111111111111111111"] (required)
  priorityFeeInLamports: number, the priority fee in lamports. Default is 30_000. (optional)
  shouldLog: boolean, whether to log progress to stdout. Default is false. (optional)`;

  protected async _call(input: string): Promise<string> {
    try {
      const params: CompressedAirdropInput = JSON.parse(input);

      const txs = await this.solanaKit.sendCompressedAirdrop(
        params.mintAddress,
        params.amount,
        params.decimals,
        params.recipients,
        params.priorityFeeInLamports || 30_000,
        params.shouldLog || false,
      );

      return JSON.stringify({
        status: "success",
        message: `Airdropped ${params.amount} tokens to ${params.recipients.length} recipients.`,
        transactionHashes: txs,
      } as CompressedAirdropResponse);
    } catch (error: any) {
      return this.handleError(error);
    }
  }
}
