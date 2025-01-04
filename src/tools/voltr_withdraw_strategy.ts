import { VoltrClient } from "@voltr/sdk";
import { SolanaAgentKit } from "../agent";
import {
  PublicKey,
  sendAndConfirmTransaction,
  Transaction,
} from "@solana/web3.js";
import BN from "bn.js";
import {
  Account,
  getAccount,
  TOKEN_2022_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";

/**
 * Withdraws assets from a Voltr strategy
 * @param agent SolanaAgentKit instance
 * @param withdrawAmount Amount to withdraw in base units (BN)
 * @param vault Public key of the target vault
 * @param strategy Public key of the target strategy
 * @returns Transaction signature for the deposit
 */
export async function voltrWithdrawStrategy(
  agent: SolanaAgentKit,
  withdrawAmount: BN,
  vault: PublicKey,
  strategy: PublicKey,
): Promise<string> {
  const vc = new VoltrClient(agent.connection, agent.wallet);
  const { vaultAssetIdleAuth } = vc.findVaultAddresses(vault);
  const vaultAccount = await vc.fetchVaultAccount(vault);
  const vaultAssetMint = vaultAccount.asset.assetMint;
  const strategyAccount = await vc.fetchStrategyAccount(strategy);
  const liquidityReserve = strategyAccount.counterpartyAssetTa;
  const protocolProgram = strategyAccount.protocolProgram;
  const vaultStrategy = vc.findVaultStrategy(vaultAssetIdleAuth, strategy);

  let liquidityReserveAccount: Account;
  try {
    liquidityReserveAccount = await getAccount(
      agent.connection,
      liquidityReserve,
      "confirmed",
      TOKEN_PROGRAM_ID,
    );
  } catch (error) {
    liquidityReserveAccount = await getAccount(
      agent.connection,
      liquidityReserve,
      "confirmed",
      TOKEN_2022_PROGRAM_ID,
    );
  }
  const liquidityReserveAuth = liquidityReserveAccount.owner;

  const response = await fetch(
    `https://voltr.xyz/api/remaining-accounts/withdraw-strategy?vault=${vault.toBase58()}&strategy=${strategy.toBase58()}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    },
  );

  const data = (await response.json()).data as {
    pubkey: string;
    isSigner: boolean;
    isWritable: boolean;
  }[];

  const remainingAccounts = data.map((account) => ({
    pubkey: new PublicKey(account.pubkey),
    isSigner: account.isSigner,
    isWritable: account.isWritable,
  }));

  const withdrawIx = await vc.createWithdrawStrategyIx(withdrawAmount, {
    vault,
    vaultAssetMint,
    strategy: strategy,
    vaultStrategy: vaultStrategy,
    counterpartyAssetTa: liquidityReserve,
    counterpartyAssetTaAuth: liquidityReserveAuth,
    protocolProgram: protocolProgram,
    remainingAccounts,
  });

  const transaction = new Transaction();
  transaction.add(withdrawIx);

  const txSig = await sendAndConfirmTransaction(agent.connection, transaction, [
    agent.wallet,
  ]);
  return txSig;
}
