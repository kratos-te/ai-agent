import { VoltrClient } from "@voltr/sdk";
import { SolanaAgentKit } from "../agent";
import {
  PublicKey,
  sendAndConfirmTransaction,
  Transaction,
} from "@solana/web3.js";
import BN from "bn.js";

/**
 * Deposits assets into a Voltr strategy
 * @param agent SolanaAgentKit instance
 * @param depositAmount Amount to deposit in base units (BN)
 * @param vault Public key of the target vault
 * @param strategy Public key of the target strategy
 * @returns Transaction signature for the deposit
 */
export async function voltrDepositStrategy(
  agent: SolanaAgentKit,
  depositAmount: BN,
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

  const response = await fetch(
    `https://voltr.xyz/api/remaining-accounts/deposit-strategy?vault=${vault.toBase58()}&strategy=${strategy.toBase58()}`,
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

  const depositIx = await vc.createDepositStrategyIx(depositAmount, {
    vault,
    vaultAssetMint,
    strategy: strategy,
    vaultStrategy: vaultStrategy,
    counterpartyAssetTa: liquidityReserve,
    protocolProgram: protocolProgram,
    remainingAccounts,
  });

  const transaction = new Transaction();
  transaction.add(depositIx);

  const txSig = await sendAndConfirmTransaction(
    agent.connection,
    transaction,
    [agent.wallet],
    {
      commitment: "confirmed",
    },
  );
  return txSig;
}
