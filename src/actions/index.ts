import deployTokenAction from "./deployToken";
import balanceAction from "./balance";
import transferAction from "./transfer";
import deployCollectionAction from "./deployCollection";
import mintNFTAction from "./mintNFT";
import tradeAction from "./trade";
import requestFundsAction from "./requestFunds";
import resolveDomainAction from "./resolveDomain";
import getTokenDataAction from "./getTokenData";
import getTPSAction from "./getTPS";
import fetchPriceAction from "./fetchPrice";
import stakeWithJupAction from "./stakeWithJup";
import registerDomainAction from "./registerDomain";
import lendAssetAction from "./lendAsset";
import createGibworkTaskAction from "./createGibworkTask";
import resolveSolDomainAction from "./resolveSolDomain";
import pythFetchPriceAction from "./pythFetchPrice";
import getOwnedDomainsForTLDAction from "./getOwnedDomainsForTLD";
import getPrimaryDomainAction from "./getPrimaryDomain";
import getAllDomainsTLDsAction from "./getAllDomainsTLDs";
import getOwnedAllDomainsAction from "./getOwnedAllDomains";
import createImageAction from "./createImage";
import getMainAllDomainsDomainAction from "./getMainAllDomainsDomain";
import getAllRegisteredAllDomainsAction from "./getAllRegisteredAllDomains";
import raydiumCreateCpmmAction from "./raydiumCreateCpmm";
import raydiumCreateAmmV4Action from "./raydiumCreateAmmV4";
import createOrcaSingleSidedWhirlpoolAction from "./createOrcaSingleSidedWhirlpool";
import launchPumpfunTokenAction from "./launchPumpfunToken";

export const actions = [
  deployTokenAction,
  balanceAction,
  transferAction,
  deployCollectionAction,
  mintNFTAction,
  tradeAction,
  requestFundsAction,
  resolveDomainAction,
  getTokenDataAction,
  getTPSAction,
  fetchPriceAction,
  stakeWithJupAction,
  registerDomainAction,
  lendAssetAction,
  createGibworkTaskAction,
  resolveSolDomainAction,
  pythFetchPriceAction,
  getOwnedDomainsForTLDAction,
  getPrimaryDomainAction,
  getAllDomainsTLDsAction,
  getOwnedAllDomainsAction,
  createImageAction,
  getMainAllDomainsDomainAction,
  getAllRegisteredAllDomainsAction,
  raydiumCreateCpmmAction,
  raydiumCreateAmmV4Action,
  createOrcaSingleSidedWhirlpoolAction,
  launchPumpfunTokenAction,
];

export type { Action, ActionExample, Handler } from "../types/action";
