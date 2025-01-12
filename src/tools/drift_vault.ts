import {
  BASE_PRECISION,
  convertToNumber,
  getLimitOrderParams,
  getMarketOrderParams,
  getOrderParams,
  MainnetPerpMarkets,
  MainnetSpotMarkets,
  MarketType,
  numberToSafeBN,
  PERCENTAGE_PRECISION,
  PositionDirection,
  PostOnlyParams,
  PRICE_PRECISION,
  QUOTE_PRECISION,
  TEN,
} from "@drift-labs/sdk";
import {
  WithdrawUnit,
  encodeName,
  getVaultDepositorAddressSync,
} from "@drift-labs/vaults-sdk";
import {
  ComputeBudgetProgram,
  PublicKey,
  type TransactionInstruction,
} from "@solana/web3.js";
import type { SolanaAgentKit } from "../agent";
import { BN } from "bn.js";
import { initClients } from "./drift";

export function getMarketIndexAndType(name: `${string}-${string}`) {
  const [symbol, type] = name.toUpperCase().split("-");

  if (type === "PERP") {
    const token = MainnetPerpMarkets.find((v) => v.symbol === symbol);
    if (!token) {
      throw new Error("Drift doesn't have that market");
    }
    return { marketIndex: token.marketIndex, marketType: MarketType.PERP };
  }

  const token = MainnetSpotMarkets.find((v) => v.symbol === symbol);
  if (!token) {
    throw new Error("Drift doesn't have that market");
  }
  return { marketIndex: token.marketIndex, marketType: MarketType.SPOT };
}

async function getOrCreateVaultDepositor(agent: SolanaAgentKit, vault: string) {
  const { vaultClient, cleanUp } = await initClients(agent);
  const vaultPublicKey = new PublicKey(vault);
  const vaultDepositor = getVaultDepositorAddressSync(
    vaultClient.program.programId,
    vaultPublicKey,
    agent.wallet.publicKey,
  );

  try {
    await vaultClient.getVaultDepositor(vaultDepositor);
    await cleanUp();
    return vaultDepositor;
  } catch (e) {
    // @ts-expect-error - error message is a string
    if (e.message === "Account not found") {
      await vaultClient.initializeVaultDepositor(vaultDepositor);
    }
    await cleanUp();
    return vaultDepositor;
  }
}

/**
  Create a vault
  @param agent SolanaAgentKit instance
  @param params Vault creation parameters
  @param params.name Name of the vault (must be unique)
  @param params.marketName Market name of the vault (e.g. "USDC-SPOT")
  @param params.redeemPeriod Redeem period in seconds
  @param params.maxTokens Maximum amount that can be deposited into the vault (in tokens)
  @param params.minDepositAmount Minimum amount that can be deposited into the vault (in tokens)
  @param params.managementFee Management fee percentage (e.g 2 == 2%)
  @param params.profitShare Profit share percentage (e.g 20 == 20%)
  @param params.hurdleRate Hurdle rate percentage
  @param params.permissioned Whether the vault uses a whitelist
  @returns Promise<anchor.Web3.TransactionSignature> - The transaction signature of the vault creation
*/
export async function createVault(
  agent: SolanaAgentKit,
  params: {
    name: string;
    marketName: `${string}-${string}`;
    redeemPeriod: number;
    maxTokens: number;
    minDepositAmount: number;
    managementFee: number;
    profitShare: number;
    hurdleRate?: number;
    permissioned?: boolean;
  },
) {
  try {
    const { vaultClient, driftClient, cleanUp } = await initClients(agent);
    const marketIndexAndType = getMarketIndexAndType(params.marketName);

    if (!marketIndexAndType) {
      throw new Error("Invalid market name");
    }

    const spotMarket = driftClient.getSpotMarketAccount(
      marketIndexAndType.marketIndex,
    );

    if (!spotMarket) {
      throw new Error("Market not found");
    }

    const spotPrecision = TEN.pow(new BN(spotMarket.decimals));

    if (marketIndexAndType.marketType === MarketType.PERP) {
      throw new Error("Only SPOT market names are supported");
    }

    const tx = await vaultClient.initializeVault({
      name: encodeName(params.name),
      spotMarketIndex: marketIndexAndType.marketIndex,
      hurdleRate: new BN(params.hurdleRate ?? 0)
        .mul(PERCENTAGE_PRECISION)
        .div(new BN(100))
        .toNumber(),
      profitShare: new BN(params.profitShare)
        .mul(PERCENTAGE_PRECISION)
        .div(new BN(100))
        .toNumber(),
      minDepositAmount: numberToSafeBN(params.minDepositAmount, spotPrecision),
      redeemPeriod: new BN(params.redeemPeriod * 86400),
      maxTokens: new BN(params.maxTokens).mul(spotPrecision),
      managementFee: new BN(params.managementFee)
        .mul(PERCENTAGE_PRECISION)
        .div(new BN(100)),
      permissioned: params.permissioned ?? false,
    });

    await cleanUp();

    return tx;
  } catch (e) {
    // @ts-expect-error - error message is a string
    throw new Error(`Failed to create Drift vault: ${e.message}`);
  }
}

/**
  Update the vault's info
  @param agent SolanaAgentKit instance
  @param vault Vault address
  @param params Vault update parameters
  @param params.redeemPeriod Redeem period in seconds
  @param params.maxTokens Maximum amount that can be deposited into the vault (in tokens)
  @param params.minDepositAmount Minimum amount that can be deposited into the vault (in tokens)
  @param params.managementFee Management fee percentage (e.g 2 == 2%)
  @param params.profitShare Profit share percentage (e.g 20 == 20%)
  @param params.hurdleRate Hurdle rate percentage
  @param params.permissioned Whether the vault uses a whitelist
  @returns Promise<anchor.Web3.TransactionSignature> - The transaction signature of the vault update
*/
export async function updateVault(
  agent: SolanaAgentKit,
  vault: string,
  params: {
    redeemPeriod?: number;
    maxTokens?: number;
    minDepositAmount?: number;
    managementFee?: number;
    profitShare?: number;
    hurdleRate?: number;
    permissioned?: boolean;
  },
) {
  try {
    const { vaultClient, cleanUp, driftClient } = await initClients(agent);
    const vaultPublicKey = new PublicKey(vault);
    const vaultDetails = await vaultClient.getVault(vaultPublicKey);

    const spotMarket = driftClient.getSpotMarketAccount(
      vaultDetails.spotMarketIndex,
    );

    if (!spotMarket) {
      throw new Error("Market not found");
    }

    const spotPrecision = TEN.pow(new BN(spotMarket.decimals));

    const tx = await vaultClient.managerUpdateVault(vaultPublicKey, {
      redeemPeriod: new BN(
        params.redeemPeriod
          ? params.redeemPeriod * 86400
          : vaultDetails.redeemPeriod,
      ),
      maxTokens: params.maxTokens
        ? numberToSafeBN(params.maxTokens, spotPrecision)
        : vaultDetails.maxTokens,
      minDepositAmount: params.minDepositAmount
        ? numberToSafeBN(params.minDepositAmount, spotPrecision)
        : vaultDetails.minDepositAmount,
      managementFee: params.managementFee
        ? new BN(params.managementFee)
            .mul(PERCENTAGE_PRECISION)
            .div(new BN(100))
        : vaultDetails.managementFee,
      profitShare: params.profitShare
        ? new BN(params.profitShare)
            .mul(PERCENTAGE_PRECISION)
            .div(new BN(100))
            .toNumber()
        : vaultDetails.profitShare,
      hurdleRate: params.hurdleRate
        ? new BN(params.hurdleRate)
            .mul(PERCENTAGE_PRECISION)
            .div(new BN(100))
            .toNumber()
        : vaultDetails.hurdleRate,
      permissioned: params.permissioned ?? vaultDetails.permissioned,
    });

    await cleanUp();

    return tx;
  } catch (e) {
    // @ts-expect-error - error message is a string
    throw new Error(`Failed to update Drift vault: ${e.message}`);
  }
}

export async function getVaultInfo(
  agent: SolanaAgentKit,
  vaultAddress: string,
) {
  try {
    const { vaultClient, cleanUp } = await initClients(agent);
    const vaultPublicKey = new PublicKey(vaultAddress);
    const vaultDetails = await vaultClient.getVault(vaultPublicKey);

    await cleanUp();

    return vaultDetails;
  } catch (e) {
    // @ts-expect-error - error message is a string
    throw new Error(`Failed to get vault info: ${e.message}`);
  }
}

/**
  Deposit tokens into a vault
  @param agent SolanaAgentKit instance
  @param amount Amount to deposit into the vault (in tokens)
  @param vault Vault address
  @returns Promise<anchor.Web3.TransactionSignature> - The transaction signature of the deposit
*/
export async function depositIntoVault(
  agent: SolanaAgentKit,
  amount: number,
  vault: string,
) {
  const { vaultClient, driftClient, cleanUp } = await initClients(agent);

  try {
    const vaultPublicKey = new PublicKey(vault);
    const [isOwned, vaultDetails] = await Promise.all([
      getIsOwned(agent, vault),
      vaultClient.getVault(vaultPublicKey),
    ]);
    const spotMarket = driftClient.getSpotMarketAccount(
      vaultDetails.spotMarketIndex,
    );

    if (!spotMarket) {
      throw new Error("Market not found");
    }

    const spotPrecision = TEN.pow(new BN(spotMarket.decimals));
    const amountBN = numberToSafeBN(amount, spotPrecision);

    if (isOwned) {
      return await vaultClient.managerDeposit(vaultPublicKey, amountBN);
    }

    const vaultDepositor = await getOrCreateVaultDepositor(agent, vault);
    const tx = await vaultClient.deposit(vaultDepositor, amountBN);

    await cleanUp();

    return tx;
  } catch (e) {
    // @ts-expect-error - error message is a string
    throw new Error(`Failed to deposit into Drift vault: ${e.message}`);
  }
}

/**
  Request a withdrawal from a vault. If successful redemption period starts and the user can redeem the tokens after the period ends
  @param agent SolanaAgentKit instance
  @param amount Amount to withdraw from the vault (in shares)
  @param vault Vault address
*/
export async function requestWithdrawalFromVault(
  agent: SolanaAgentKit,
  amount: number,
  vault: string,
) {
  try {
    const { vaultClient, cleanUp } = await initClients(agent);
    const vaultPublicKey = new PublicKey(vault);
    const isOwned = await getIsOwned(agent, vault);

    if (isOwned) {
      return await vaultClient.managerRequestWithdraw(
        vaultPublicKey,
        new BN(amount.toFixed(0)),
        WithdrawUnit.SHARES,
      );
    }

    const vaultDepositor = await getOrCreateVaultDepositor(agent, vault);

    const tx = await vaultClient.requestWithdraw(
      vaultDepositor,
      new BN(amount.toFixed(0)),
      WithdrawUnit.SHARES,
    );

    await cleanUp();

    return tx;
  } catch (e) {
    throw new Error(
      // @ts-expect-error - error message is a string
      `Failed to request withdrawal from Drift vault: ${e.message}`,
    );
  }
}

/**
  Withdraw tokens once the redemption period has elapsed.
  @param agent SolanaAgentKit instance
  @param vault Vault address
  @returns Promise<anchor.Web3.TransactionSignature> - The transaction signature of the redemption
*/
export async function withdrawFromDriftVault(
  agent: SolanaAgentKit,
  vault: string,
) {
  try {
    const { vaultClient, cleanUp } = await initClients(agent);
    const vaultPublicKey = new PublicKey(vault);
    const isOwned = await getIsOwned(agent, vault);

    if (isOwned) {
      return await vaultClient.managerWithdraw(vaultPublicKey);
    }

    const vaultDepositor = await getOrCreateVaultDepositor(agent, vault);

    const tx = await vaultClient.withdraw(vaultDepositor);

    await cleanUp();

    return tx;
  } catch (e) {
    // @ts-expect-error - error message is a string
    throw new Error(`Failed to redeem tokens from Drift vault: ${e.message}`);
  }
}

/**
  Get if vault is owned by the user
  @param agent SolanaAgentKit instance
  @param vault Vault address
  @returns Promise<boolean> - Whether the vault is owned by the user
*/
async function getIsOwned(agent: SolanaAgentKit, vault: string) {
  try {
    const { vaultClient, cleanUp } = await initClients(agent);
    const vaultPublicKey = new PublicKey(vault);
    const vaultDetails = await vaultClient.getVault(vaultPublicKey);
    const isOwned = vaultDetails.delegate.equals(agent.wallet.publicKey);

    await cleanUp();

    return isOwned;
  } catch (e) {
    // @ts-expect-error - error message is a string
    throw new Error(`Failed to check if vault is owned: ${e.message}`);
  }
}

/**
  Carry out a trade with a delegated vault
  @param agent SolanaAgentKit instance
  @param amount Amount to trade (in tokens)
  @param symbol Symbol of the token to trade
  @param action Action to take (e.g. "buy" or "sell")
  @param type Type of trade (e.g. "market" or "limit")
  @param vault Vault address
*/
export async function tradeDriftVault(
  agent: SolanaAgentKit,
  vault: string,
  amount: number,
  symbol: string,
  action: "buy" | "sell",
  type: "market" | "limit",
  price?: number,
) {
  try {
    const { driftClient, vaultClient, cleanUp } = await initClients(agent);
    const [isOwned, vaultDetails, driftLookupTableAccount] = await Promise.all([
      getIsOwned(agent, vault),
      vaultClient.getVault(new PublicKey(vault)),
      driftClient.fetchMarketLookupTableAccount(),
    ]);

    if (!isOwned) {
      throw new Error(
        "This vault is owned by someone else, so you can't trade with it",
      );
    }

    driftClient.authority = new PublicKey(vault);
    driftClient.activeSubAccountId = 0;
    vaultClient.driftClient = driftClient;

    const usdcSpotMarket = driftClient.getSpotMarketAccount(0);
    if (!usdcSpotMarket) {
      throw new Error("USDC-SPOT market not found");
    }

    const usdcPrecision = TEN.pow(new BN(usdcSpotMarket.decimals));
    const vaultWithdrawalsRequested = convertToNumber(
      vaultDetails.totalWithdrawRequested,
      usdcPrecision,
    );
    // this is actually the authority provided
    const user = driftClient.getUser();
    const currentVaultBalance =
      convertToNumber(user.getNetSpotMarketValue(), QUOTE_PRECISION) +
      convertToNumber(user.getUnrealizedPNL(true), QUOTE_PRECISION);
    const availableBalanceInUSD =
      currentVaultBalance - vaultWithdrawalsRequested;

    if (amount > availableBalanceInUSD) {
      throw new Error(
        "Insufficient balance: You don't have enough balance to make this trade",
      );
    }

    const perpMarketIndexAndType = getMarketIndexAndType(
      `${symbol.toUpperCase()}-PERP`,
    );
    const perpMarketAccount = driftClient.getPerpMarketAccount(
      perpMarketIndexAndType.marketIndex,
    );

    if (!perpMarketIndexAndType || !perpMarketAccount) {
      throw new Error(
        "Invalid symbol: Drift doesn't have a market for this token",
      );
    }

    const perpOracle = driftClient.getOracleDataForPerpMarket(
      perpMarketAccount.marketIndex,
    );
    const oraclePriceNumber = convertToNumber(
      perpOracle.price,
      PRICE_PRECISION,
    );
    const baseAmount = amount / oraclePriceNumber;
    const instructions: TransactionInstruction[] = [];

    instructions.push(
      ComputeBudgetProgram.setComputeUnitLimit({ units: 1400000 }),
    );

    if (type === "limit" || price) {
      if (!price) {
        throw new Error("Price is required for limit orders");
      }

      const instruction = await driftClient.getPlaceOrdersIx([
        getOrderParams(
          getLimitOrderParams({
            price: numberToSafeBN(price, PRICE_PRECISION),
            marketType: MarketType.PERP,
            baseAssetAmount: numberToSafeBN(baseAmount, BASE_PRECISION),
            direction:
              action === "buy"
                ? PositionDirection.LONG
                : PositionDirection.SHORT,
            marketIndex: perpMarketAccount.marketIndex,
            postOnly: PostOnlyParams.SLIDE,
          }),
        ),
      ]);

      instructions.push(instruction);
    } else {
      // defaults to market order if type is not limit and price is not provided
      const instruction = await driftClient.getPlaceOrdersIx([
        getOrderParams(
          getMarketOrderParams({
            marketType: MarketType.PERP,
            baseAssetAmount: numberToSafeBN(baseAmount, BASE_PRECISION),
            direction:
              action === "buy"
                ? PositionDirection.LONG
                : PositionDirection.SHORT,
            marketIndex: perpMarketAccount.marketIndex,
          }),
        ),
      ]);
      instructions.push(instruction);
    }

    const tx = await driftClient.txSender.sendVersionedTransaction(
      await driftClient.txSender.getVersionedTransaction(
        instructions,
        [driftLookupTableAccount],
        [],
        driftClient.opts,
      ),
    );

    await cleanUp();

    return tx;
  } catch (e) {
    // @ts-expect-error - error message is a string
    throw new Error(`Failed to trade with Drift vault: ${e.message}`);
  }
}
