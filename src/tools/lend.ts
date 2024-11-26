import { VersionedTransaction } from "@solana/web3.js";
import { SolanaAgentKit } from "../index";
import { LuloAccountDetailsResponse, LuloDepositAssetMint } from "../types";
import { getPriorityFees } from "../utils/send_tx";
import { LULO_API } from "../constants";

/**
 * Lend tokens for yields using Lulo
 * @param agent SolanaAgentKit instance
 * @param asset Mint address of the token to lend (as supported by Lulo)
 * @param amount Amount to lend (in token decimals)
 * @param LULO_API_KEY Valid API key for Lulo
 * @returns Transaction signature
 */
export async function lendAsset(
  agent: SolanaAgentKit,
  asset: LuloDepositAssetMint,
  amount: number,
  LULO_API_KEY = "",
): Promise<string> {
  try {
    if (!LULO_API_KEY) {
      throw new Error("Missing Lulo API key");
    }

    const request = {
      owner: agent.wallet.publicKey.toBase58(),
      mintAddress: asset,
      depositAmount: amount,
    };

    const priority = `?priorityFee=${getPriorityFees(agent.connection)}`;

    const response = await fetch(
      `${LULO_API}/generate/account/deposit${priority}`,
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "x-wallet-pubkey": agent.wallet.publicKey.toBase58(),
          "x-api-key": LULO_API_KEY,
        },
        body: JSON.stringify(request),
      },
    );

    const {
      data: { transactionMeta },
    } = await response.json();

    const luloTxn = VersionedTransaction.deserialize(
      Buffer.from(transactionMeta[0].transaction, "base64"),
    );

    // Sign and send transaction
    luloTxn.sign([agent.wallet]);
    const signature = await agent.connection.sendTransaction(luloTxn);

    return signature;
  } catch (error: any) {
    throw new Error(`Lending failed: ${error.message}`);
  }
}

/**
 * Fetch lending details for agent
 * @param agent SolanaAgentKit instance
 * @param LULO_API_KEY Valid API key for Lulo
 * @returns Lending account details
 */
export async function getLendingDetails(
  agent: SolanaAgentKit,
  LULO_API_KEY = "",
): Promise<LuloAccountDetailsResponse> {
  try {
    if (!LULO_API_KEY) {
      throw new Error("Missing Lulo API key");
    }

    const response = await fetch(`${LULO_API}/account`, {
      headers: {
        "x-wallet-pubkey": agent.wallet.publicKey.toBase58(),
        "x-api-key": LULO_API_KEY,
      },
    });

    const { data } = await response.json();

    return data as LuloAccountDetailsResponse;
  } catch (error: any) {
    throw new Error(`Failed to fetch lending details: ${error.message}`);
  }
}
