import { SolanaAgentKit } from "../index";
import { 
  createMint,
  getOrCreateAssociatedTokenAccount,
  mintTo,
  TOKEN_PROGRAM_ID,
  Account
} from "@solana/spl-token";

/**
 * Deploy a new SPL token
 * @param agent SolanaAgentKit instance
 * @param decimals Number of decimals for the token (default: 9)
 * @param initialSupply Initial supply to mint (optional)
 * @returns Object containing token mint address and initial account (if supply was minted)
 */
export async function deploy_token(
  agent: SolanaAgentKit,
  decimals: number = 9,
  initialSupply?: number
) {
  try {
    // Create new token mint
    const mint = await createMint(
      agent.connection,
      agent.wallet,        // Payer
      agent.wallet_address, // Mint authority
      agent.wallet_address, // Freeze authority (optional)
      decimals,
      undefined,          // Optional keypair
      undefined,          // Confirmation options
      TOKEN_PROGRAM_ID
    );

    // If initial supply is specified, mint tokens
    let tokenAccount: Account | undefined = undefined;
    if (initialSupply) {
      // Create associated token account for the wallet
      tokenAccount = await getOrCreateAssociatedTokenAccount(
        agent.connection,
        agent.wallet,
        mint,
        agent.wallet_address
      );

      // Mint the initial supply
      await mintTo(
        agent.connection,
        agent.wallet,
        mint,
        tokenAccount.address,
        agent.wallet_address,
        initialSupply * Math.pow(10, decimals)
      );
    }

    return {
      mint: mint,
      tokenAccount: tokenAccount?.address
    };
  } catch (error: any) {
    throw new Error(`Token deployment failed: ${error.message}`);
  }
}
