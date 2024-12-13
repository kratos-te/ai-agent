import { PublicKey } from "@solana/web3.js";
import { JupiterTokenData } from "../types";

export async function fetchTokenDataByMint(
  mint: PublicKey,
): Promise<JupiterTokenData | undefined> {
  try {
    const response = await fetch("https://tokens.jup.ag/tokens?tags=verified", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = (await response.json()) as JupiterTokenData[];
    const token = data.find(
      (token: JupiterTokenData) => token.address === mint.toString(),
    );
    return token;
  } catch (error: any) {
    throw new Error(`Error fetching token data: ${error.message}`);
  }
}

export async function fetchTokenDataByName(
  name: string,
): Promise<JupiterTokenData | undefined> {
  try {
    const response = await fetch("https://tokens.jup.ag/tokens?tags=verified", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = (await response.json()) as JupiterTokenData[];
    const token = data.find((token: JupiterTokenData) => token.name === name);
    return token;
  } catch (error) {
    throw new Error(`Error fetching token data: ${error.message}`);
  }
}
