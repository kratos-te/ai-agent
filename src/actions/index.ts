import deployTokenAction from "./deployToken";
import balanceAction from "./balance";
import transferAction from "./transfer";
import deployCollectionAction from "./deployCollection";
import mintNFTAction from "./mintNFT";
import tradeAction from "./trade";
import requestFundsAction from "./requestFunds";

export const actions = [
  deployTokenAction,
  balanceAction,
  transferAction,
  deployCollectionAction,
  mintNFTAction,
  tradeAction,
  requestFundsAction,
  // Add more actions here as they are implemented
];

export type { Action, ActionExample, Handler } from "../types/action"; 