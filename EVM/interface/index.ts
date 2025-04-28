import type { Address, AccessList } from "viem";

/**
 * Arguments for the get_balance tool
 */
export interface GetBalanceArgs {
  /**
   * The wallet to get the balance of
   */
  wallet: Address;
}

// No arguments needed since we're getting the connected wallet
export interface GetWalletAddressArgs {}

export interface SendTransactionArgs {
  /**
   * The recipient address
   */
  to: Address;
  /**
   * The amount of ETH to send (in ETH, not Wei)
   */
  value?: string;
  /**
   * Contract interaction data
   */
  data?: `0x${string}`;
  /**
   * Unique number identifying this transaction
   */
  nonce?: number;
  /**
   * Gas price in Gwei
   */
  gasPrice?: string;
  /**
   * EIP-2930 access list
   */
  accessList?: AccessList;
  /**
   * Factory dependencies (bytecodes of smart contracts)
   */
  factoryDeps?: `0x${string}`[];
  /**
   * Paymaster address
   */
  paymaster?: Address;
  /**
   * Paymaster input
   */
  paymasterInput?: `0x${string}`;
}
