import { PublicKey } from "@solana/web3.js";

/**
 * Common token addresses used across the toolkit
 */
export const TOKENS = {
  USDC: new PublicKey("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"),
} as const;

/**
 * Default configuration options
 * @property {number} SLIPPAGE_BPS - Default slippage tolerance in basis points (300 = 3%)
 * @property {number} TOKEN_DECIMALS - Default number of decimals for new tokens
 */
export const DEFAULT_OPTIONS = {
  SLIPPAGE_BPS: 300,
  TOKEN_DECIMALS: 9,
} as const;
