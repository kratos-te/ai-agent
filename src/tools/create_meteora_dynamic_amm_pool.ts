import AmmImpl from "@mercurial-finance/dynamic-amm-sdk";
import { SolanaAgentKit } from "../agent";
import BN from "bn.js";
import {
  ComputeBudgetProgram,
  PublicKey,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
import { CustomizableParams } from "@mercurial-finance/dynamic-amm-sdk/dist/cjs/src/amm/types";

/**
 * Create Meteora Dynamic AMM pool
 * @param agent SolanaAgentKit instance
 * @param tokenAMint Token A mint
 * @param tokenBMint Token B mint
 * @param tokenAAmount Token A amount in lamport units
 * @param tokenBAmount Token B amount in lamport units
 * @param customizableParams Parameters to create Dynamic AMM pool
 *        tradeFeeNumerator (number): Trade fee numerator, with default denominator is 100000
 *        activationType (enum): Should be ActivationType.Timestamp or ActivationType.Slot
 *        activationPoint (BN | null): Activation point depending on activation type, or null if pool doesn't have an activation point
 *        hasAlphaVault (boolean): Whether the pool has Meteora alpha vault or not
 *        padding (Array<number>): Should be set to value Array(90).fill(0)
 * @returns Transaction signature
 */
export async function createMeteoraDynamicAMMPool(
  agent: SolanaAgentKit,
  tokenAMint: PublicKey,
  tokenBMint: PublicKey,
  tokenAAmount: BN,
  tokenBAmount: BN,
  customizableParams: CustomizableParams,
  computeUnitMicroLamports: number,
): Promise<string> {
  // console.log(`>>> Creating Meteora Dynamic Pool...`);
  // console.log(`- Using tokenAMint: ${tokenAMint.toString()}`);
  // console.log(`- Using tokenBMint: ${tokenBMint.toString()}`);
  // console.log(`- Using tokenAAmount: ${tokenAAmount.toString()}`);
  // console.log(`- Using tokenBAmount: ${tokenBAmount.toString()}`);
  // console.log(
  //   `- Using tradeFeeNumerator ${customizableParams.tradeFeeNumerator}`,
  // );
  // console.log(`- Using activationType: ${customizableParams.activationType}`);
  // console.log(
  //   `- Using activationPoint: ${customizableParams.activationPoint?.toString()}`,
  // );
  // console.log(`- Using hasAlphaVault: ${customizableParams.hasAlphaVault}`);

  const initPoolTx =
    await AmmImpl.createCustomizablePermissionlessConstantProductPool(
      agent.connection,
      agent.wallet_address,
      tokenAMint,
      tokenBMint,
      tokenAAmount,
      tokenBAmount,
      customizableParams,
    );

  initPoolTx.add(
    ComputeBudgetProgram.setComputeUnitPrice({
      microLamports: computeUnitMicroLamports,
    }),
  );

  const initPoolTxHash = await sendAndConfirmTransaction(
    agent.connection,
    initPoolTx,
    [agent.wallet],
  ).catch((err) => {
    console.error(err);
    throw err;
  });
  // console.log(`<<< Finished creating Meteora Dynamic Pool.`);

  return initPoolTxHash;
}
