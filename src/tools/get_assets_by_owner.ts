import { SolanaAgentKit } from "../index";
import { PublicKey } from "@solana/web3.js";
import * as dotenv from "dotenv";
dotenv.config();

/**
 * Fetch assets by owner using the Helius Digital Asset Standard (DAS) API
 * @param agent SolanaAgentKit instance
 * @param ownerPublicKey Owner's Solana wallet PublicKey
 * @param limit Number of assets to retrieve per request
 * @returns Assets owned by the specified address
 */
export async function getAssetsByOwner(
  agent: SolanaAgentKit,
  ownerPublicKey: PublicKey,
  limit: number,
): Promise<any> {
  try {
    const apiKey = process.env.HELIUS_API_KEY;
    if (!apiKey) {
      throw new Error("HELIUS_API_KEY not found in environment variables");
    }

    const url = `https://mainnet.helius-rpc.com/?api-key=${apiKey}`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: "get-assets",
        method: "getAssetsByOwner",
        params: {
          ownerAddress: ownerPublicKey.toString(),
          page: 3,
          limit: limit,
          displayOptions: {
            showFungible: true,
          },
        },
      }),
    });

    if (!response.ok) {
      throw new Error(
        `Failed to fetch: ${response.status} - ${response.statusText}`,
      );
    }

    const data = await response.json();
    console.log("Assets by Owner: ", data.result.items);

    return data.result.items;
  } catch (error: any) {
    console.error("Error retrieving assets: ", error.message);
    throw new Error(`Assets retrieval failed: ${error.message}`);
  }
}
