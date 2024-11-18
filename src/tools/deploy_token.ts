import { SolanaAgentKit } from "../index";
import {
  createInitializeMint2Instruction,
  MINT_SIZE,
  getMinimumBalanceForRentExemptAccount,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { Keypair, SystemProgram, Transaction  } from "@solana/web3.js";
import { sendTx } from "../utils/send_tx";

/**
 * Deploy a new SPL token
 * @param agent SolanaAgentKit instance
 * @param decimals Number of decimals for the token (default: 9)
 * @param initialSupply Initial supply to mint (optional)
 * @returns Object containing token mint address and initial account (if supply was minted)
 */
export async function deploy_token(
  agent: SolanaAgentKit,
  decimals: number = 9
  // initialSupply?: number
) {
  try {
    // Create new token mint
    const lamports = await getMinimumBalanceForRentExemptAccount(
      agent.connection
    );

    const mint = Keypair.generate();

    console.log("Mint address: ", mint.publicKey.toString());
    console.log("Agent address: ", agent.wallet_address.toString());

    let account_create_ix = SystemProgram.createAccount({
      fromPubkey: agent.wallet_address,
      newAccountPubkey: mint.publicKey,
      lamports,
      space: MINT_SIZE,
      programId: TOKEN_PROGRAM_ID,
    });

    let create_mint_ix = createInitializeMint2Instruction(
      mint.publicKey,
      decimals,
      agent.wallet_address,
      agent.wallet_address,
      TOKEN_PROGRAM_ID
    );

    let tx = new Transaction().add(account_create_ix, create_mint_ix);

    let hash = await sendTx(agent, tx, [mint]);

    console.log("Transaction hash: ", hash);

    console.log(
      "Token deployed successfully. Mint address: ",
      mint.publicKey.toString()
    );

    return {
      mint: mint.publicKey,
    };
  } catch (error: any) {
    console.log(error);
    throw new Error(`Token deployment failed: ${error.message}`);
  }
}
