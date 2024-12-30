import {
  PublicKey,
  Transaction,
  sendAndConfirmTransaction,
  TransactionInstruction,
} from "@solana/web3.js";
import { SolanaAgentKit } from "../index";
import {
  ManifestClient,
  WrapperPlaceOrderParamsExternal,
} from "@cks-systems/manifest-sdk";
import { sleep } from "openai/core";
import { OrderType } from "@cks-systems/manifest-sdk/dist/types/src/manifest";

/**
 * Place limit orders using Manifest
 * @param agent SolanaAgentKit instance
 * @param marketId Public key for the manifest market
 * @param quantity Amount to trade in tokens
 * @param side Buy or Sell
 * @param price Price in tokens ie. SOL/USDC
 * @returns Transaction signature
 */
export async function limitOrder(
  agent: SolanaAgentKit,
  marketId: PublicKey,
  quantity: number,
  side: string,
  price: number,
): Promise<string> {
  try {
    const { setupNeeded, instructions, wrapperKeypair } =
      await ManifestClient.getSetupIxs(
        agent.connection,
        marketId,
        agent.wallet.publicKey,
      );

    if (setupNeeded) {
      const tx = new Transaction().add(...instructions);
      const { blockhash } = await agent.connection.getLatestBlockhash();
      tx.recentBlockhash = blockhash;
      tx.feePayer = agent.wallet.publicKey!;
      if (wrapperKeypair) {
        tx.sign(wrapperKeypair);
      }

      await sendAndConfirmTransaction(agent.connection, tx, [agent.wallet]);

      await sleep(5_000);
    }

    const mfxClient = await ManifestClient.getClientForMarket(
      agent.connection,
      marketId,
      agent.wallet,
    );

    const orderParams: WrapperPlaceOrderParamsExternal = {
      numBaseTokens: quantity,
      tokenPrice: price,
      isBid: side === "buy",
      lastValidSlot: 0,
      orderType: OrderType.Limit,
      clientOrderId: Number(Math.random() * 1000),
    };

    const depositPlaceOrderIx: TransactionInstruction[] =
      await mfxClient.placeOrderWithRequiredDepositIx(
        agent.wallet.publicKey,
        orderParams,
      );
    const signature = await sendAndConfirmTransaction(
      agent.connection,
      new Transaction().add(...depositPlaceOrderIx),
      [agent.wallet],
    );

    return signature;
  } catch (error: any) {
    throw new Error(`Limit Order failed: ${error.message}`);
  }
}
