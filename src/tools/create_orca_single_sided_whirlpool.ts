import { Keypair, PublicKey } from "@solana/web3.js";
import { SolanaAgentKit } from "../agent";
import { BN, Wallet } from "@coral-xyz/anchor";
import { Decimal } from "decimal.js";
import { PDAUtil, ORCA_WHIRLPOOL_PROGRAM_ID, ORCA_WHIRLPOOLS_CONFIG, WhirlpoolContext, TickUtil, PriceMath, PoolUtil, TokenExtensionContextForPool, NO_TOKEN_EXTENSION_CONTEXT, TokenExtensionUtil, WhirlpoolIx, IncreaseLiquidityQuoteParam, increaseLiquidityQuoteByInputTokenWithParams } from "@orca-so/whirlpools-sdk";
import { Percentage, resolveOrCreateATAs, TransactionBuilder } from "@orca-so/common-sdk";
import { increaseLiquidityIx, increaseLiquidityV2Ix, initTickArrayIx, openPositionWithTokenExtensionsIx } from "@orca-so/whirlpools-sdk/dist/instructions";
import { getAssociatedTokenAddressSync, TOKEN_2022_PROGRAM_ID } from "@solana/spl-token";

const FEE_TIERS = {
  0.01: 1,
  0.02: 2,
  0.04: 4,
  0.05: 8,
  0.16: 16,
  0.30: 64,
  0.65: 96,
  1.00: 128,
  2.00: 256,
} as const;

type FeeTierPercentage = keyof typeof FEE_TIERS;

export async function createOrcaSingleSidedWhirlpool(
  agent: SolanaAgentKit,
  depositTokenAmount: Decimal,
  depositTokenMint: PublicKey,
  otherTokenMint: PublicKey,
  initialPrice: Decimal,
  upperPrice: Decimal,
  feeTier: FeeTierPercentage,
): Promise<string> {
  const wallet = new Wallet(agent.wallet);
  const ctx = WhirlpoolContext.from(agent.connection, wallet, ORCA_WHIRLPOOL_PROGRAM_ID);
  const fetcher = ctx.fetcher;

  const correctTokenOrder = PoolUtil.orderMints(otherTokenMint, depositTokenMint).map(
    (addr) => addr.toString(),
  );
  const inverseOrder = correctTokenOrder[0] !== otherTokenMint.toString();
  let mintA, mintB;
  if (!inverseOrder) {
    [mintA, mintB] = [otherTokenMint, depositTokenMint];
  } else {
    [mintA, mintB] = [depositTokenMint, otherTokenMint];
    initialPrice = new Decimal(1 / initialPrice.toNumber());
    upperPrice = new Decimal(1 / upperPrice.toNumber());
  }
  const mintAAccount = await fetcher.getMintInfo(otherTokenMint);
  const mintBAccount = await fetcher.getMintInfo(depositTokenMint);
  if (mintAAccount === null || mintBAccount === null) throw Error('Mint account not found');

  const tickSpacing = FEE_TIERS[feeTier];
  const tickIndex = PriceMath.priceToTickIndex(initialPrice, mintAAccount.decimals, mintBAccount.decimals);
  const initialTick = TickUtil.getInitializableTickIndex(tickIndex, tickSpacing);
  if (!TickUtil.checkTickInBounds(initialTick)) throw Error('Initial tick is out of bounds');

  const tokenExtensionCtx: TokenExtensionContextForPool = {
    ...NO_TOKEN_EXTENSION_CONTEXT,
    tokenMintWithProgramA: mintAAccount,
    tokenMintWithProgramB: mintBAccount,
  };

  const feeTierKey = PDAUtil.getFeeTier(
    ORCA_WHIRLPOOL_PROGRAM_ID,
    ORCA_WHIRLPOOLS_CONFIG,
    tickSpacing,
  ).publicKey;

  const initSqrtPrice = PriceMath.tickIndexToSqrtPriceX64(initialTick);
  const tokenVaultAKeypair = Keypair.generate();
  const tokenVaultBKeypair = Keypair.generate();

  const whirlpoolPda = PDAUtil.getWhirlpool(
    ORCA_WHIRLPOOL_PROGRAM_ID,
    ORCA_WHIRLPOOLS_CONFIG,
    mintA,
    mintB,
    FEE_TIERS[feeTier],
  );

  const txBuilder = new TransactionBuilder(
    ctx.provider.connection,
    ctx.provider.wallet,
    ctx.txBuilderOpts,
  );

  const tokenBadgeA = PDAUtil.getTokenBadge(
    ORCA_WHIRLPOOL_PROGRAM_ID,
    ORCA_WHIRLPOOLS_CONFIG,
    mintA,
  ).publicKey;
  const tokenBadgeB = PDAUtil.getTokenBadge(
    ORCA_WHIRLPOOL_PROGRAM_ID,
    ORCA_WHIRLPOOLS_CONFIG,
    mintB,
  ).publicKey;

  const baseParamsPool = {
    initSqrtPrice,
    whirlpoolsConfig: ORCA_WHIRLPOOLS_CONFIG,
    whirlpoolPda,
    tokenMintA: mintA,
    tokenMintB: mintB,
    tokenVaultAKeypair,
    tokenVaultBKeypair,
    feeTierKey,
    tickSpacing: tickSpacing,
    funder: wallet.publicKey
  };

  const initPoolIx = !TokenExtensionUtil.isV2IxRequiredPool(tokenExtensionCtx)
    ? WhirlpoolIx.initializePoolIx(ctx.program, baseParamsPool)
    : WhirlpoolIx.initializePoolV2Ix(ctx.program, {
      ...baseParamsPool,
      tokenProgramA: tokenExtensionCtx.tokenMintWithProgramA.tokenProgram,
      tokenProgramB: tokenExtensionCtx.tokenMintWithProgramB.tokenProgram,
      tokenBadgeA,
      tokenBadgeB,
    });

  const initialTickArrayStartTick = TickUtil.getStartTickIndex(
    initialTick,
    tickSpacing,
  );
  const initialTickArrayPda = PDAUtil.getTickArray(
    ctx.program.programId,
    whirlpoolPda.publicKey,
    initialTickArrayStartTick,
  );

  txBuilder.addInstruction(initPoolIx);
  txBuilder.addInstruction(
    initTickArrayIx(ctx.program, {
      startTick: initialTickArrayStartTick,
      tickArrayPda: initialTickArrayPda,
      whirlpool: whirlpoolPda.publicKey,
      funder: wallet.publicKey,
    }),
  );

  const tickLowerIndex = inverseOrder ? initialTick - tickSpacing : initialTick + tickSpacing;
  const tickUpperIndex = PriceMath.priceToTickIndex(upperPrice, mintAAccount.decimals, mintBAccount.decimals);
  const tickLowerInitializableIndex = TickUtil.getInitializableTickIndex(tickLowerIndex, tickSpacing);
  const tickUpperInitializableIndex = TickUtil.getInitializableTickIndex(tickUpperIndex, tickSpacing);
  const increasLiquidityQuoteParam: IncreaseLiquidityQuoteParam = {
    inputTokenAmount: BN(depositTokenAmount),
    inputTokenMint: depositTokenMint,
    tokenMintA: mintA,
    tokenMintB: mintB,
    tickCurrentIndex: initialTick,
    sqrtPrice: initSqrtPrice,
    tickLowerIndex: tickLowerInitializableIndex,
    tickUpperIndex: tickUpperInitializableIndex,
    tokenExtensionCtx: tokenExtensionCtx,
    slippageTolerance: Percentage.fromFraction(0, 100)
  }
  const liquidityInput = increaseLiquidityQuoteByInputTokenWithParams(
    increasLiquidityQuoteParam
  )
  const { liquidityAmount: liquidity, tokenMaxA, tokenMaxB } = liquidityInput;

  const positionMintKeypair = Keypair.generate();
  const positionMintPubkey = positionMintKeypair.publicKey;
  const positionPda = PDAUtil.getPosition(
    ORCA_WHIRLPOOL_PROGRAM_ID,
    positionMintPubkey,
  );
  const positionTokenAccountAddress = getAssociatedTokenAddressSync(
    positionMintPubkey,
    wallet.publicKey,
    ctx.accountResolverOpts.allowPDAOwnerAddress,
    TOKEN_2022_PROGRAM_ID,
  );

  const params = {
    funder: wallet.publicKey,
    owner: wallet.publicKey,
    positionPda,
    positionTokenAccount: positionTokenAccountAddress,
    whirlpool: whirlpoolPda.publicKey,
    tickLowerIndex: tickLowerInitializableIndex,
    tickUpperIndex: tickUpperInitializableIndex,
  };
  const positionIx = openPositionWithTokenExtensionsIx(ctx.program, {
    ...params,
    positionMint: positionMintPubkey,
    withTokenMetadataExtension: true,
  })
  txBuilder.addInstruction(positionIx);
  txBuilder.addSigner(positionMintKeypair);

  const [ataA, ataB] = await resolveOrCreateATAs(
    ctx.connection,
    wallet.publicKey,
    [
      { tokenMint: mintA, wrappedSolAmountIn: tokenMaxA },
      { tokenMint: mintB, wrappedSolAmountIn: tokenMaxB },
    ],
    () => ctx.fetcher.getAccountRentExempt(),
    wallet.publicKey,
    undefined,
    ctx.accountResolverOpts.allowPDAOwnerAddress,
    ctx.accountResolverOpts.createWrappedSolAccountMethod,
  );
  const { address: tokenOwnerAccountA, ...tokenOwnerAccountAIx } = ataA;
  const { address: tokenOwnerAccountB, ...tokenOwnerAccountBIx } = ataB;

  txBuilder.addInstruction(tokenOwnerAccountAIx);
  txBuilder.addInstruction(tokenOwnerAccountBIx);

  const tickArrayLowerPda = PDAUtil.getTickArrayFromTickIndex(
    tickLowerInitializableIndex,
    tickSpacing,
    whirlpoolPda.publicKey,
    ctx.program.programId,
  );
  const tickArrayUpperPda = PDAUtil.getTickArrayFromTickIndex(
    tickUpperInitializableIndex,
    tickSpacing,
    whirlpoolPda.publicKey,
    ctx.program.programId,
  );

  const baseParamsLiquidity = {
    liquidityAmount: liquidity,
    tokenMaxA,
    tokenMaxB,
    whirlpool: whirlpoolPda.publicKey,
    positionAuthority: wallet.publicKey,
    position: positionPda.publicKey,
    positionTokenAccount: positionTokenAccountAddress,
    tokenOwnerAccountA,
    tokenOwnerAccountB,
    tokenVaultA: tokenVaultAKeypair.publicKey,
    tokenVaultB: tokenVaultBKeypair.publicKey,
    tickArrayLower: tickArrayLowerPda.publicKey,
    tickArrayUpper: tickArrayUpperPda.publicKey,
  };

  const liquidityIx = !TokenExtensionUtil.isV2IxRequiredPool(
    tokenExtensionCtx,
  )
    ? increaseLiquidityIx(ctx.program, baseParamsLiquidity)
    : increaseLiquidityV2Ix(ctx.program, {
      ...baseParamsLiquidity,
      tokenMintA: mintA,
      tokenMintB: mintB,
      tokenProgramA: tokenExtensionCtx.tokenMintWithProgramA.tokenProgram,
      tokenProgramB: tokenExtensionCtx.tokenMintWithProgramB.tokenProgram,
    });
  txBuilder.addInstruction(liquidityIx);

  const txId = await txBuilder.buildAndExecute();

  return txId;
}
