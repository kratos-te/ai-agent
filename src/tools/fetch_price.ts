import { SolanaAgentKit } from "../index";
import { Tool } from "langchain/tools";

/**
 * Fetch the price of a given token in USDC using Jupiter API
 * @param agent SolanaAgentKit instance
 * @param tokenId The token mint address
 * @returns The price of the token in USDC
 */
export async function fetchPrice(
  agent: SolanaAgentKit,
  tokenId: string
): Promise<string> {
  try {
    const response = await fetch(
      `https://api.jup.ag/price/v2?ids=${tokenId}`
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch price: ${response.statusText}`);
    }

    const data = await response.json();

    const price = data.data[tokenId]?.price;

    if (!price) {
      throw new Error("Price data not available for the given token.");
    }

    return price;
  } catch (error: any) {
    throw new Error(`Price fetch failed: ${error.message}`);
  }
}