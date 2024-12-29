import { SolanaAgentKit } from "../index";
import { TCompSDK } from "@tensor-oss/tcomp-sdk";
import { PublicKey, Transaction } from "@solana/web3.js";
import { AnchorProvider, Wallet } from "@coral-xyz/anchor";
import { BN } from "bn.js";
import { getAssociatedTokenAddress, createAssociatedTokenAccountInstruction, TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID, getAccount } from '@solana/spl-token';

export async function listNFTForSale(
  agent: SolanaAgentKit,
  nftMint: PublicKey,
  price: number,
  expirySeconds?: number
): Promise<string> {
  try {
    const mintInfo = await agent.connection.getAccountInfo(nftMint);
    if (!mintInfo) {
      throw new Error(`NFT mint ${nftMint.toString()} does not exist`);
    }

    const ata = await getAssociatedTokenAddress(
      nftMint,
      agent.wallet_address
    );

    try {
      const tokenAccount = await getAccount(
        agent.connection,
        ata
      );
      console.log("Token Account:", tokenAccount);
    } catch (e) {
      console.error("Token account error:", e);
      throw new Error(`No token account found for mint ${nftMint.toString()}`);
    }

    const provider = new AnchorProvider(
      agent.connection,
      new Wallet(agent.wallet),
      AnchorProvider.defaultOptions()
    );
    
    const tcompSdk = new TCompSDK({ provider });
    const priceInLamports = new BN(price * 1e9);
    const expiry = expirySeconds ? new BN(expirySeconds) : null;

    const { tx } = await tcompSdk.listCore({
      asset: nftMint,
      owner: agent.wallet_address,
      amount: priceInLamports,
      expireInSec: expiry
    });

    const transaction = new Transaction();
    transaction.add(...tx.ixs);
    return await agent.connection.sendTransaction(transaction, [agent.wallet, ...tx.extraSigners]);
  } catch (error: any) {
    console.error("Full error details:", error);
    throw error;
  }
}

export async function buyNFT(
  agent: SolanaAgentKit,
  nftMint: PublicKey,
  maxPrice: number
): Promise<string> {
  const provider = new AnchorProvider(
    agent.connection,
    new Wallet(agent.wallet),
    AnchorProvider.defaultOptions()
  );
  
  const tcompSdk = new TCompSDK({ provider });
  const maxPriceInLamports = new BN(maxPrice * 1e9);

  const { tx } = await tcompSdk.buyCore({
    asset: nftMint,
    buyer: agent.wallet_address,
    maxAmount: maxPriceInLamports,
    owner: agent.wallet_address,
    rentDest: agent.wallet_address,
    payer: agent.wallet_address,
    makerBroker: null
  });

  const transaction = new Transaction();
  transaction.add(...tx.ixs);
  return await agent.connection.sendTransaction(transaction, [agent.wallet, ...tx.extraSigners]);
}

export async function cancelListing(
  agent: SolanaAgentKit,
  nftMint: PublicKey
): Promise<string> {
  const provider = new AnchorProvider(
    agent.connection,
    new Wallet(agent.wallet),
    AnchorProvider.defaultOptions()
  );
  
  const tcompSdk = new TCompSDK({ provider });

  const { tx } = await tcompSdk.delistCore({
    asset: nftMint,
    owner: agent.wallet_address,
    rentDest: agent.wallet_address
  });

  const transaction = new Transaction();
  transaction.add(...tx.ixs);
  return await agent.connection.sendTransaction(transaction, [agent.wallet, ...tx.extraSigners]);
} 