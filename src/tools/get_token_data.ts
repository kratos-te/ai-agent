import { PublicKey } from "@solana/web3.js";
import { JupiterTokenData } from "../types";

export async function fetchTokenData(
  name?: string,
  symbol?: string,
  mint?: PublicKey,
): Promise<JupiterTokenData | undefined> {
  try {
    if (!mint && !symbol && !name) {
      throw new Error("Either mint address, name or symbol is required");
    }

    const response = await fetch("https://tokens.jup.ag/tokens?tags=verified", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = (await response.json()) as JupiterTokenData[];
    const token = data.find((token: JupiterTokenData) => {
      if (mint) {
        return token.address === mint.toBase58();
      }
      if (symbol) {
        return token.symbol === symbol;
      }
      if (name) {
        return token.name === name;
      }
      return false;
    });
    return token;
  } catch (error: any) {
    throw new Error(`Error fetching token data: ${error.message}`);
  }
}
