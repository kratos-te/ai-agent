import { VoltrClient } from "@voltr/sdk";
import { SolanaAgentKit } from "../agent";
import { PublicKey } from "@solana/web3.js";
import BN from "bn.js";

/**
 * Deposits assets into a Voltr strategy
 * @param agent SolanaAgentKit instance
 * @param vault Public key of the target vault
 * @returns Transaction signature for the deposit
 */
export async function voltrGetAssetAmount(
  agent: SolanaAgentKit,
  vault: PublicKey,
): Promise<string> {
  const vc = new VoltrClient(agent.connection, agent.wallet);
  const vaultAccount = await vc.fetchVaultAccount(vault);
  const totalAssetAmount: BN = vaultAccount.asset.totalAmount;
  const { vaultAssetIdleAuth } = vc.findVaultAddresses(vault);
  const vaultStrategyAccounts =
    await vc.fetchVaultStrategyAccounts(vaultAssetIdleAuth);
  const strategyInfo = vaultStrategyAccounts.map((vaultStrategyAccount) => ({
    strategyId: vaultStrategyAccount.account.strategy.toBase58(),
    amount: vaultStrategyAccount.account.currentAmount.toString(),
  }));

  const result = {
    totalAmount: totalAssetAmount.toString(),
    strategies: strategyInfo,
  };

  return JSON.stringify(result);
}
