import { PublicKey } from "@solana/web3.js";
import Decimal from "decimal.js";
import { Tool } from "@langchain/core/tools";
import {
  GibworkCreateTaskReponse,
  PythFetchPriceResponse,
  SolanaAgentKit,
} from "../index";
import { create_image } from "../tools/create_image";
import { BN } from "@coral-xyz/anchor";
import { FEE_TIERS, getMainAllDomainsDomain } from "../tools";
import { toJSON } from "../utils/toJSON";
import deployTokenAction from "../actions/deployToken";
import balanceAction from "../actions/balance";
import transferAction from "../actions/transfer";
import deployCollectionAction from "../actions/deployCollection";
import mintNFTAction from "../actions/mintNFT";
import tradeAction from "../actions/trade";
import requestFundsAction from "../actions/requestFunds";
import fetchPriceAction from "../actions/fetchPrice";
import registerDomainAction from "../actions/registerDomain";
import resolveDomainAction from "../actions/resolveDomain";
import getPrimaryDomainAction from "../actions/getPrimaryDomain";
import launchPumpfunTokenAction from "../actions/launchPumpfunToken";
import createImageAction from "../actions/createImage";
import lendAssetAction from "../actions/lendAsset";
import getTPSAction from "../actions/getTPS";
import createOrcaSingleSidedWhirlpoolAction from "../actions/createOrcaSingleSidedWhirlpool";
import raydiumCreateCpmmAction from "../actions/raydiumCreateCpmm";
import pythFetchPriceAction from "../actions/pythFetchPrice";
import getOwnedDomainsForTLDAction from "../actions/getOwnedDomainsForTLD";
import createGibworkTaskAction from "../actions/createGibworkTask";
import getTokenDataAction from "../actions/getTokenData";
import stakeWithJupAction from "../actions/stakeWithJup";
import resolveSolDomainAction from "../actions/resolveSolDomain";
import getAllDomainsTLDsAction from "../actions/getAllDomainsTLDs";
import getMainAllDomainsDomainAction from "../actions/getMainAllDomainsDomain";
import raydiumCreateAmmV4Action from "../actions/raydiumCreateAmmV4";
import tokenDataByTickerAction from "../actions/tokenDataByTicker";
import compressedAirdropAction from "../actions/compressedAirdrop";
import raydiumCreateClmmAction from "../actions/raydiumCreateClmm";
import createOpenbookMarketAction from "../actions/createOpenbookMarket";

export class SolanaBalanceTool extends Tool {
  private action = balanceAction;
  name = this.action.name;
  description = this.action.description;

  constructor(private solanaKit: SolanaAgentKit) {
    super();
  }

  async _call(input: string): Promise<string> {
    try {
      // Parse input as JSON if provided, otherwise use empty object
      const parsedInput = input ? JSON.parse(input) : {};

      // Validate and execute using the action
      const result = await this.action.handler(this.solanaKit, parsedInput);

      return JSON.stringify(result);
    } catch (error: any) {
      return JSON.stringify({
        status: "error",
        message: error.message,
        code: error.code || "UNKNOWN_ERROR",
      });
    }
  }
}

export class SolanaTransferTool extends Tool {
  private action = transferAction;
  name = this.action.name;
  description = this.action.description;

  constructor(private solanaKit: SolanaAgentKit) {
    super();
  }

  async _call(input: string): Promise<string> {
    try {
      // Parse input as JSON
      const parsedInput = JSON.parse(input);

      // Validate and execute using the action
      const result = await this.action.handler(this.solanaKit, parsedInput);

      return JSON.stringify(result);
    } catch (error: any) {
      return JSON.stringify({
        status: "error",
        message: error.message,
        code: error.code || "UNKNOWN_ERROR",
      });
    }
  }
}

export class SolanaDeployTokenTool extends Tool {
  private action = deployTokenAction;
  name = this.action.name;
  description = this.action.description;

  constructor(private solanaKit: SolanaAgentKit) {
    super();
  }

  async _call(input: string): Promise<string> {
    try {
      // Parse input as JSON
      const parsedInput = JSON.parse(input);

      // Validate and execute using the action
      const result = await this.action.handler(this.solanaKit, parsedInput);

      return JSON.stringify(result);
    } catch (error: any) {
      return JSON.stringify({
        status: "error",
        message: error.message,
        code: error.code || "UNKNOWN_ERROR",
      });
    }
  }
}

export class SolanaDeployCollectionTool extends Tool {
  private action = deployCollectionAction;
  name = this.action.name;
  description = this.action.description;

  constructor(private solanaKit: SolanaAgentKit) {
    super();
  }

  async _call(input: string): Promise<string> {
    try {
      // Parse input as JSON
      const parsedInput = JSON.parse(input);

      // Validate and execute using the action
      const result = await this.action.handler(this.solanaKit, parsedInput);

      return JSON.stringify(result);
    } catch (error: any) {
      return JSON.stringify({
        status: "error",
        message: error.message,
        code: error.code || "UNKNOWN_ERROR",
      });
    }
  }
}

export class SolanaMintNFTTool extends Tool {
  private action = mintNFTAction;
  name = this.action.name;
  description = this.action.description;

  constructor(private solanaKit: SolanaAgentKit) {
    super();
  }

  async _call(input: string): Promise<string> {
    try {
      // Parse input as JSON
      const parsedInput = JSON.parse(input);

      // Validate and execute using the action
      const result = await this.action.handler(this.solanaKit, parsedInput);

      return JSON.stringify(result);
    } catch (error: any) {
      return JSON.stringify({
        status: "error",
        message: error.message,
        code: error.code || "UNKNOWN_ERROR",
      });
    }
  }
}

export class SolanaTradeTool extends Tool {
  private action = tradeAction;
  name = this.action.name;
  description = this.action.description;

  constructor(private solanaKit: SolanaAgentKit) {
    super();
  }

  async _call(input: string): Promise<string> {
    try {
      // Parse input as JSON
      const parsedInput = JSON.parse(input);

      // Validate and execute using the action
      const result = await this.action.handler(this.solanaKit, parsedInput);

      return JSON.stringify(result);
    } catch (error: any) {
      return JSON.stringify({
        status: "error",
        message: error.message,
        code: error.code || "UNKNOWN_ERROR",
      });
    }
  }
}

export class SolanaRequestFundsTool extends Tool {
  private action = requestFundsAction;
  name = this.action.name;
  description = this.action.description;

  constructor(private solanaKit: SolanaAgentKit) {
    super();
  }

  async _call(_input: string): Promise<string> {
    try {
      // No input needed for this action
      const result = await this.action.handler(this.solanaKit, {});

      return JSON.stringify(result);
    } catch (error: any) {
      return JSON.stringify({
        status: "error",
        message: error.message,
        code: error.code || "UNKNOWN_ERROR",
      });
    }
  }
}

export class SolanaRegisterDomainTool extends Tool {
  private action = registerDomainAction
  name = this.action.name;
  description = this.action.description;

  constructor(private solanaKit: SolanaAgentKit) {
    super();
  }

  private validateInput(input: any): void {
    if (!input.name || typeof input.name !== "string") {
      throw new Error("name is required and must be a string");
    }
    if (
      input.spaceKB !== undefined &&
      (typeof input.spaceKB !== "number" || input.spaceKB <= 0)
    ) {
      throw new Error("spaceKB must be a positive number when provided");
    }
  }

  protected async _call(input: string): Promise<string> {
    try {
      const parsedInput = toJSON(input);
      this.validateInput(parsedInput);

      const tx = await this.action.handler(this.solanaKit, parsedInput);

      return JSON.stringify({
        status: "success",
        message: "Domain registered successfully",
        transaction: tx,
        domain: `${parsedInput.name}.sol`,
        spaceKB: parsedInput.spaceKB || 1,
      });
    } catch (error: any) {
      return JSON.stringify({
        status: "error",
        message: error.message,
        code: error.code || "UNKNOWN_ERROR",
      });
    }
  }
}

export class SolanaResolveDomainTool extends Tool {
  private action = resolveSolDomainAction;
  name = this.action.name;
  description = this.action.description;

  constructor(private solanaKit: SolanaAgentKit) {
    super();
  }

  protected async _call(input: string): Promise<string> {
    try {
      const domain = { domain: input.trim() };
      const publicKey = await this.action.handler(this.solanaKit, domain);

      return JSON.stringify({
        status: "success",
        message: "Domain resolved successfully",
        publicKey: publicKey.toBase58(),
      });
    } catch (error: any) {
      return JSON.stringify({
        status: "error",
        message: error.message,
        code: error.code || "UNKNOWN_ERROR",
      });
    }
  }
}

export class SolanaGetDomainTool extends Tool {
  private action = getPrimaryDomainAction;
  name = this.action.name;
  description = this.action.description;

  constructor(private solanaKit: SolanaAgentKit) {
    super();
  }

  protected async _call(input: string): Promise<string> {
    try {
      const account = new PublicKey(input.trim());
      const domain = await this.solanaKit.getPrimaryDomain(account);

      return JSON.stringify({
        status: "success",
        message: "Primary domain retrieved successfully",
        domain,
      });
    } catch (error: any) {
      return JSON.stringify({
        status: "error",
        message: error.message,
        code: error.code || "UNKNOWN_ERROR",
      });
    }
  }
}

export class SolanaGetWalletAddressTool extends Tool {
  name = "solana_get_wallet_address";
  description = `Get the wallet address of the agent`;

  constructor(private solanaKit: SolanaAgentKit) {
    super();
  }

  async _call(_input: string): Promise<string> {
    return this.solanaKit.wallet_address.toString();
  }
}

export class SolanaPumpfunTokenLaunchTool extends Tool {
  private action = launchPumpfunTokenAction;
  name = this.action.name;

  description = this.action.description;

  constructor(private solanaKit: SolanaAgentKit) {
    super();
  }

  private validateInput(input: any): void {
    if (!input.tokenName || typeof input.tokenName !== "string") {
      throw new Error("tokenName is required and must be a string");
    }
    if (!input.tokenTicker || typeof input.tokenTicker !== "string") {
      throw new Error("tokenTicker is required and must be a string");
    }
    if (!input.description || typeof input.description !== "string") {
      throw new Error("description is required and must be a string");
    }
    if (!input.imageUrl || typeof input.imageUrl !== "string") {
      throw new Error("imageUrl is required and must be a string");
    }
    if (
      input.initialLiquiditySOL !== undefined &&
      typeof input.initialLiquiditySOL !== "number"
    ) {
      throw new Error("initialLiquiditySOL must be a number when provided");
    }
  }

  protected async _call(input: string): Promise<string> {
    try {
      // Parse and normalize input
      input = input.trim();
      const parsedInput = JSON.parse(input);

      this.validateInput(parsedInput);

      // Launch token with validated input
      await this.action.handler(
        this.solanaKit,
        parsedInput,
      );

      return JSON.stringify({
        status: "success",
        message: "Token launched successfully on Pump.fun",
        tokenName: parsedInput.tokenName,
        tokenTicker: parsedInput.tokenTicker,
      });
    } catch (error: any) {
      return JSON.stringify({
        status: "error",
        message: error.message,
        code: error.code || "UNKNOWN_ERROR",
      });
    }
  }
}

export class SolanaCreateImageTool extends Tool {
  private action = createImageAction;
  name = this.action.name;
  description = this.action.description;

  constructor(private solanaKit: SolanaAgentKit) {
    super();
  }

  private validateInput(input: string): void {
    if (typeof input !== "string" || input.trim().length === 0) {
      throw new Error("Input must be a non-empty string prompt");
    }
  }

  protected async _call(input: string): Promise<string> {
    try {
      this.validateInput(input);
      const parsedInput = JSON.parse(input);
      const result = await this.action.handler(this.solanaKit, parsedInput);

      return JSON.stringify({
        status: "success",
        message: "Image created successfully",
        ...result,
      });
    } catch (error: any) {
      return JSON.stringify({
        status: "error",
        message: error.message,
        code: error.code || "UNKNOWN_ERROR",
      });
    }
  }
}

export class SolanaLendAssetTool extends Tool {
  private action = lendAssetAction;
  name = this.action.name;
  description = this.action.description;

  constructor(private solanaKit: SolanaAgentKit) {
    super();
  }

  async _call(input: string): Promise<string> {
    try {
      const amount = JSON.parse(input).amount || input;

      const tx = await this.action.handler(this.solanaKit, { amount });

      return JSON.stringify({
        status: "success",
        message: "Asset lent successfully",
        transaction: tx,
        amount: amount,
      });
    } catch (error: any) {
      return JSON.stringify({
        status: "error",
        message: error.message,
        code: error.code || "UNKNOWN_ERROR",
      });
    }
  }
}

export class SolanaTPSCalculatorTool extends Tool {
  private action = getTPSAction;
  name = this.action.name;
  description = this.action.description;

  constructor(private solanaKit: SolanaAgentKit) {
    super();
  }

  async _call(_input: string): Promise<string> {
    try {
      const tps = await this.action.handler(this.solanaKit, {});
      return `Solana (mainnet-beta) current transactions per second: ${tps}`;
    } catch (error: any) {
      return `Error fetching TPS: ${error.message}`;
    }
  }
}

export class SolanaStakeTool extends Tool {
  private action = stakeWithJupAction;
  name = this.action.name;
  description = this.action.description;

  constructor(private solanaKit: SolanaAgentKit) {
    super();
  }

  protected async _call(input: string): Promise<string> {
    try {
      const parsedInput = JSON.parse(input) || Number(input);

      const tx = await this.action.handler(this.solanaKit, parsedInput);

      return JSON.stringify({
        status: "success",
        message: "Staked successfully",
        transaction: tx,
        amount: parsedInput.amount,
      });
    } catch (error: any) {
      return JSON.stringify({
        status: "error",
        message: error.message,
        code: error.code || "UNKNOWN_ERROR",
      });
    }
  }
}

/**
 * Tool to fetch the price of a token in USDC
 */
export class SolanaFetchPriceTool extends Tool {
  private action = fetchPriceAction;
  name = this.action.name;
  description = this.action.description;

  constructor(private solanaKit: SolanaAgentKit) {
    super();
  }

  async _call(input: string): Promise<string> {
    try {

      const parsedInput = { tokenId: input.trim() };
      const price = await this.action.handler(this.solanaKit, parsedInput);
      return JSON.stringify({
        status: "success",
        tokenId: input.trim(),
        priceInUSDC: price,
      });
    } catch (error: any) {
      return JSON.stringify({
        status: "error",
        message: error.message,
        code: error.code || "UNKNOWN_ERROR",
      });
    }
  }
}

export class SolanaTokenDataTool extends Tool {
  private action = getTokenDataAction
  name = this.action.name;
  description = this.action.description;

  constructor(private solanaKit: SolanaAgentKit) {
    super();
  }

  protected async _call(input: string): Promise<string> {
    try {

      const parsedInput = JSON.parse(input);
      const tokenData = await this.action.handler(this.solanaKit, parsedInput);

      return JSON.stringify({
        status: "success",
        tokenData: tokenData,
      });
    } catch (error: any) {
      return JSON.stringify({
        status: "error",
        message: error.message,
        code: error.code || "UNKNOWN_ERROR",
      });
    }
  }
}

export class SolanaTokenDataByTickerTool extends Tool {
  private action = tokenDataByTickerAction;
  name = this.action.name;
  description = this.action.description;

  constructor(private solanaKit: SolanaAgentKit) {
    super();
  }

  protected async _call(input: string): Promise<string> {
    try {
      const ticker = input.trim();
      const tokenData = await this.action.handler(this.solanaKit, { ticker });
      return JSON.stringify({
        status: "success",
        tokenData: tokenData,
      });
    } catch (error: any) {
      return JSON.stringify({
        status: "error",
        message: error.message,
        code: error.code || "UNKNOWN_ERROR",
      });
    }
  }
}

export class SolanaCompressedAirdropTool extends Tool {
  private action = compressedAirdropAction;
  name = this.action.name;
  description = this.action.description;

  constructor(private solanaKit: SolanaAgentKit) {
    super();
  }

  protected async _call(input: string): Promise<string> {
    try {
      const parsedInput = JSON.parse(input);
      const txs = await this.action.handler(this.solanaKit, parsedInput);
      return JSON.stringify({
        status: "success",
        message: `Airdropped ${parsedInput.amount} tokens to ${parsedInput.recipients.length} recipients.`,
        transactionHashes: txs,
      });
    } catch (error: any) {
      return JSON.stringify({
        status: "error",
        message: error.message,
        code: error.code || "UNKNOWN_ERROR",
      });
    }
  }
}

export class SolanaCreateSingleSidedWhirlpoolTool extends Tool {
  private action = createOrcaSingleSidedWhirlpoolAction;
  name = this.action.name;
  description = this.action.description;

  constructor(private solanaKit: SolanaAgentKit) {
    super();
  }

  async _call(input: string): Promise<string> {
    try {
      const inputFormat = JSON.parse(input);
      const depositTokenAmount = new BN(inputFormat.depositTokenAmount);
      const depositTokenMint = new PublicKey(inputFormat.depositTokenMint);
      const otherTokenMint = new PublicKey(inputFormat.otherTokenMint);
      const initialPrice = new Decimal(inputFormat.initialPrice);
      const maxPrice = new Decimal(inputFormat.maxPrice);
      const feeTier = inputFormat.feeTier;

      if (!feeTier || !(feeTier in FEE_TIERS)) {
        throw new Error(
          `Invalid feeTier.Available options: ${Object.keys(FEE_TIERS).join(
            ", ",
          )
          } `,
        );
      }
      const txId = await this.action.handler(this.solanaKit, {
        depositTokenAmount,
        depositTokenMint,
        otherTokenMint,
        initialPrice,
        maxPrice,
        feeTier,
      });
      return JSON.stringify({
        status: "success",
        message: "Single-sided Whirlpool created successfully",
        transaction: txId,
      });
    } catch (error: any) {
      return JSON.stringify({
        status: "error",
        message: error.message,
        code: error.code || "UNKNOWN_ERROR",
      });
    }
  }
}

export class SolanaRaydiumCreateAmmV4 extends Tool {
  private action = raydiumCreateAmmV4Action;
  name = this.action.name;
  description = this.action.description;

  constructor(private solanaKit: SolanaAgentKit) {
    super();
  }

  async _call(input: string): Promise<string> {
    try {
      const inputFormat = JSON.parse(input);

      const tx = await this.action.handler(this.solanaKit, inputFormat);

      return JSON.stringify({
        status: "success",
        message: "Create raydium amm v4 pool successfully",
        transaction: tx,
      });
    } catch (error: any) {
      return JSON.stringify({
        status: "error",
        message: error.message,
        code: error.code || "UNKNOWN_ERROR",
      });
    }
  }
}

export class SolanaRaydiumCreateClmm extends Tool {
  private action = raydiumCreateClmmAction;
  name = this.action.name;
  description = this.action.description;

  constructor(private solanaKit: SolanaAgentKit) {
    super();
  }

  async _call(input: string): Promise<string> {
    try {
      const inputFormat = JSON.parse(input);

      const tx = await this.action.handler(this.solanaKit, inputFormat);

      return JSON.stringify({
        status: "success",
        message: "Create raydium clmm pool successfully",
        transaction: tx,
      });
    } catch (error: any) {
      return JSON.stringify({
        status: "error",
        message: error.message,
        code: error.code || "UNKNOWN_ERROR",
      });
    }
  }
}

export class SolanaRaydiumCreateCpmm extends Tool {
  private action = raydiumCreateCpmmAction;
  name = this.action.name;
  description = this.action.description;

  constructor(private solanaKit: SolanaAgentKit) {
    super();
  }

  async _call(input: string): Promise<string> {
    try {
      const inputFormat = JSON.parse(input);
      const tx = await this.action.handler(this.solanaKit, inputFormat);

      return JSON.stringify({
        status: "success",
        message: "Create raydium cpmm pool successfully",
        transaction: tx,
      });
    } catch (error: any) {
      return JSON.stringify({
        status: "error",
        message: error.message,
        code: error.code || "UNKNOWN_ERROR",
      });
    }
  }
}

export class SolanaOpenbookCreateMarket extends Tool {
  private action = createOpenbookMarketAction;
  name = this.action.name;
  description = this.action.description;

  constructor(private solanaKit: SolanaAgentKit) {
    super();
  }

  async _call(input: string): Promise<string> {
    try {
      const inputFormat = JSON.parse(input);
      const tx = await this.action.handler(this.solanaKit, inputFormat);

      return JSON.stringify({
        status: "success",
        message: "Create openbook market successfully",
        transaction: tx,
      });
    } catch (error: any) {
      return JSON.stringify({
        status: "error",
        message: error.message,
        code: error.code || "UNKNOWN_ERROR",
      });
    }
  }
}

export class SolanaPythFetchPrice extends Tool {
  private action = pythFetchPriceAction;
  name = this.action.name;
  description = this.action.description;

  constructor(private solanaKit: SolanaAgentKit) {
    super();
  }

  async _call(input: string): Promise<string> {
    try {
      const parsedInput = { tokenId: input.trim() };
      const price = await this.action.handler(this.solanaKit, parsedInput);
      const response: PythFetchPriceResponse = {
        status: "success",
        priceFeedID: input,
        price: price.price,
      };
      return JSON.stringify(response);
    } catch (error: any) {
      const response: PythFetchPriceResponse = {
        status: "error",
        priceFeedID: input,
        message: error.message,
        code: error.code || "UNKNOWN_ERROR",
      };
      return JSON.stringify(response);
    }
  }
}

export class SolanaResolveAllDomainsTool extends Tool {
  private action = resolveDomainAction;
  name = this.action.name;
  description = this.action.description;

  constructor(private solanaKit: SolanaAgentKit) {
    super();
  }

  async _call(input: string): Promise<string> {
    try {
      const parsedInput = JSON.parse(input);
      const owner = await this.action.handler(this.solanaKit, parsedInput);

      if (!owner) {
        return JSON.stringify({
          status: "error",
          message: "Domain not found",
          code: "DOMAIN_NOT_FOUND",
        });
      }

      return JSON.stringify({
        status: "success",
        message: "Domain resolved successfully",
        owner: owner?.toString(),
      });
    } catch (error: any) {
      return JSON.stringify({
        status: "error",
        message: error.message,
        code: error.code || "DOMAIN_RESOLUTION_ERROR",
      });
    }
  }
}

export class SolanaGetOwnedDomains extends Tool {
  private action = getOwnedDomainsForTLDAction;
  name = this.action.name;
  description = this.action.description;

  constructor(private solanaKit: SolanaAgentKit) {
    super();
  }

  async _call(input: string): Promise<string> {
    try {
      const ownerPubkey = new PublicKey(input.trim());
      const domains = await this.action.handler(this.solanaKit, ownerPubkey);

      return JSON.stringify({
        status: "success",
        message: "Owned domains fetched successfully",
        domains: domains,
      });
    } catch (error: any) {
      return JSON.stringify({
        status: "error",
        message: error.message,
        code: error.code || "FETCH_OWNED_DOMAINS_ERROR",
      });
    }
  }
}

export class SolanaGetOwnedTldDomains extends Tool {
  private action = getOwnedDomainsForTLDAction;
  name = this.action.name;
  description = this.action.description;

  constructor(private solanaKit: SolanaAgentKit) {
    super();
  }

  async _call(input: string): Promise<string> {
    try {
      const domains = await this.action.handler(this.solanaKit, { tld: input });

      return JSON.stringify({
        status: "success",
        message: "TLD domains fetched successfully",
        domains: domains,
      });
    } catch (error: any) {
      return JSON.stringify({
        status: "error",
        message: error.message,
        code: error.code || "FETCH_TLD_DOMAINS_ERROR",
      });
    }
  }
}

export class SolanaGetAllTlds extends Tool {
  private action = getAllDomainsTLDsAction;
  name = this.action.name;
  description = this.action.description;

  constructor(private solanaKit: SolanaAgentKit) {
    super();
  }

  async _call(): Promise<string> {
    try {
      const tlds = await this.action.handler(this.solanaKit, {});

      return JSON.stringify({
        status: "success",
        message: "TLDs fetched successfully",
        tlds: tlds,
      });
    } catch (error: any) {
      return JSON.stringify({
        status: "error",
        message: error.message,
        code: error.code || "FETCH_TLDS_ERROR",
      });
    }
  }
}

export class SolanaGetMainDomain extends Tool {
  private action = getMainAllDomainsDomainAction;
  name = this.action.name;
  description = this.action.description;
  constructor(private solanaKit: SolanaAgentKit) {
    super();
  }

  async _call(input: string): Promise<string> {
    try {
      const ownerPubkey = new PublicKey(input.trim());
      const mainDomain =
        await this.action.handler(this.solanaKit, ownerPubkey);

      return JSON.stringify({
        status: "success",
        message: "Main domain fetched successfully",
        domain: mainDomain,
      });
    } catch (error: any) {
      return JSON.stringify({
        status: "error",
        message: error.message,
        code: error.code || "FETCH_MAIN_DOMAIN_ERROR",
      });
    }
  }
}

export class SolanaCreateGibworkTask extends Tool {
  private action = createGibworkTaskAction;
  name = this.action.name;
  description = this.action.description;
  constructor(private solanaSdk: SolanaAgentKit) {
    super();
  }

  protected async _call(input: string): Promise<string> {
    try {
      const parsedInput = JSON.parse(input);
      const taskData = await this.action.handler(this.solanaSdk, parsedInput);

      const response: GibworkCreateTaskReponse = {
        status: "success",
        taskId: taskData.taskId,
        signature: taskData.signature,
      };

      return JSON.stringify(response);
    } catch (err: any) {
      return JSON.stringify({
        status: "error",
        message: err.message,
        code: err.code || "CREATE_TASK_ERROR",
      });
    }
  }
}

export function createSolanaTools(solanaKit: SolanaAgentKit) {
  return [
    new SolanaBalanceTool(solanaKit),
    new SolanaTransferTool(solanaKit),
    new SolanaDeployTokenTool(solanaKit),
    new SolanaDeployCollectionTool(solanaKit),
    new SolanaMintNFTTool(solanaKit),
    new SolanaTradeTool(solanaKit),
    new SolanaRequestFundsTool(solanaKit),
    new SolanaRegisterDomainTool(solanaKit),
    new SolanaGetWalletAddressTool(solanaKit),
    new SolanaPumpfunTokenLaunchTool(solanaKit),
    new SolanaCreateImageTool(solanaKit),
    new SolanaLendAssetTool(solanaKit),
    new SolanaTPSCalculatorTool(solanaKit),
    new SolanaStakeTool(solanaKit),
    new SolanaFetchPriceTool(solanaKit),
    new SolanaGetDomainTool(solanaKit),
    new SolanaTokenDataTool(solanaKit),
    new SolanaTokenDataByTickerTool(solanaKit),
    new SolanaCompressedAirdropTool(solanaKit),
    new SolanaRaydiumCreateAmmV4(solanaKit),
    new SolanaRaydiumCreateClmm(solanaKit),
    new SolanaRaydiumCreateCpmm(solanaKit),
    new SolanaOpenbookCreateMarket(solanaKit),
    new SolanaCreateSingleSidedWhirlpoolTool(solanaKit),
    new SolanaPythFetchPrice(solanaKit),
    new SolanaResolveDomainTool(solanaKit),
    new SolanaGetOwnedDomains(solanaKit),
    new SolanaGetOwnedTldDomains(solanaKit),
    new SolanaGetAllTlds(solanaKit),
    new SolanaGetMainDomain(solanaKit),
    new SolanaResolveAllDomainsTool(solanaKit),
    new SolanaCreateGibworkTask(solanaKit),
  ];
}
