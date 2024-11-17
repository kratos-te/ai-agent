import { SolanaAgentKit } from "../index";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";

/**
 * Request SOL from the Solana faucet (devnet/testnet only)
 * @param agent - SolanaAgentKit instance
 * @returns Promise that resolves when the airdrop is confirmed
 * @throws Error if the request fails or times out
 */
export async function request_faucet_funds(agent: SolanaAgentKit) {
  const tx = await agent.connection.requestAirdrop(
    agent.wallet_address,
    5 * LAMPORTS_PER_SOL
  );
  await agent.connection.confirmTransaction(tx);
}