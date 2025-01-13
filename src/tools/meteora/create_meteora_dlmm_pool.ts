import { SolanaAgentKit } from "../../agent";
import BN from "bn.js";
import {
  ComputeBudgetProgram,
  PublicKey,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
import DLMM, { ActivationType } from "@meteora-ag/dlmm";
import { getMint } from "@solana/spl-token";

/**
 * Create Meteora DLMM pool
 * @param agent SolanaAgentKit instance
 * @param binStep DLMM pool bin step
 * @param tokenAMint Token A mint
 * @param tokenBMint Token B mint
 * @param initialPrice Initial pool price in ratio tokenA / tokenB
 * @param priceRoundingUp Whether to rounding up the initial pool price
 * @param feeBps Pool trading fee in BPS
 * @param activationType Pool activation type (ActivationType.Timestamp or ActivationType.Slot)
 * @param hasAlphaVault Whether the pool has Meteora alpha vault or not
 * @param activationPoint Activation point depending on activation type, or null if pool doesn't have an activation point
 * @returns Transaction signature
 */
export async function createMeteoraDlmmPool(
  agent: SolanaAgentKit,
  binStep: number,
  tokenAMint: PublicKey,
  tokenBMint: PublicKey,
  initialPrice: number,
  priceRoundingUp: boolean,
  feeBps: number,
  activationType: ActivationType,
  hasAlphaVault: boolean,
  activationPoint: BN | undefined,
  computeUnitMicroLamports: number,
): Promise<string> {
  const tokenAMintInfo = await getMint(agent.connection, tokenAMint);
  const tokenBMintInfo = await getMint(agent.connection, tokenBMint);

  const initPrice = DLMM.getPricePerLamport(
    tokenAMintInfo.decimals,
    tokenBMintInfo.decimals,
    initialPrice,
  );

  const activateBinId = DLMM.getBinIdFromPrice(
    initPrice,
    binStep,
    !priceRoundingUp,
  );

  // console.log(`>>> Creating Meteora DLMM pool...`);
  // console.log(`- Using tokenAMint: ${tokenAMint.toString()}`);
  // console.log(`- Using tokenBMint: ${tokenBMint.toString()}`);
  // console.log(`- Using binStep: ${binStep}`);
  // console.log(`- Using initialPrice: ${initialPrice}`);
  // console.log(`- Using priceRoundingUp: ${priceRoundingUp}`);
  // console.log(`- Using feeBps ${feeBps}`);
  // console.log(`- Using activationType: ${activationType}`);
  // console.log(`- Using activationPoint: ${activationPoint?.toString()}`);
  // console.log(`- Using hasAlphaVault: ${hasAlphaVault}`);

  const initPoolTx = await DLMM.createCustomizablePermissionlessLbPair(
    agent.connection,
    new BN(binStep),
    tokenAMint,
    tokenBMint,
    new BN(activateBinId.toString()),
    new BN(feeBps),
    activationType,
    hasAlphaVault,
    agent.wallet_address,
    activationPoint,
    {
      cluster: "mainnet-beta",
    },
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

  // console.log(`<<< Finished creating Meteora DLMM pool.`);

  return initPoolTxHash;
}
