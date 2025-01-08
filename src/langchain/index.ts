export * from "./adrena";
export * from "./alldomains";
export * from "./dexscreener";
export * from "./alldomains";
export * from "./flash";
export * from "./gibwork";
export * from "./jupiter";
export * from "./lulo";
export * from "./manifest";
export * from "./solana";
export * from "./agent";
export * from "./metaplex";
export * from "./openbook";
export * from "./orca";
export * from "./pumpfun";
export * from "./pyth";
export * from "./raydium";
export * from "./rugcheck";
export * from "./sendarcade";
export * from "./solayer";
export * from "./tensor";
export * from "./3land";
export * from "./tiplink";
export * from "./sns";
export * from "./lightprotocol";
export * from "./squads";
export * from "./helius";

import { SolanaAgentKit } from "../agent";
import {
  SolanaBalanceTool,
  SolanaBalanceOtherTool,
  SolanaTransferTool,
  SolanaDeployTokenTool,
  SolanaDeployCollectionTool,
  SolanaMintNFTTool,
  SolanaTradeTool,
  SolanaRequestFundsTool,
  SolanaRegisterDomainTool,
  SolanaGetWalletAddressTool,
  SolanaPumpfunTokenLaunchTool,
  SolanaCreateImageTool,
  SolanaLendAssetTool,
  SolanaTPSCalculatorTool,
  SolanaStakeTool,
  SolanaRestakeTool,
  SolanaFetchPriceTool,
  SolanaGetDomainTool,
  SolanaTokenDataTool,
  SolanaTokenDataByTickerTool,
  SolanaCompressedAirdropTool,
  SolanaRaydiumCreateAmmV4,
  SolanaRaydiumCreateClmm,
  SolanaRaydiumCreateCpmm,
  SolanaOpenbookCreateMarket,
  SolanaManifestCreateMarket,
  SolanaLimitOrderTool,
  SolanaBatchOrderTool,
  SolanaCancelAllOrdersTool,
  SolanaWithdrawAllTool,
  SolanaClosePosition,
  SolanaOrcaCreateCLMM,
  SolanaOrcaCreateSingleSideLiquidityPool,
  SolanaOrcaFetchPositions,
  SolanaOrcaOpenCenteredPosition,
  SolanaOrcaOpenSingleSidedPosition,
  SolanaPythFetchPrice,
  SolanaResolveDomainTool,
  SolanaGetOwnedDomains,
  SolanaGetOwnedTldDomains,
  SolanaGetAllTlds,
  SolanaGetMainDomain,
  SolanaResolveAllDomainsTool,
  SolanaCreateGibworkTask,
  SolanaRockPaperScissorsTool,
  SolanaTipLinkTool,
  SolanaListNFTForSaleTool,
  SolanaCancelNFTListingTool,
  SolanaCloseEmptyTokenAccounts,
  SolanaFetchTokenReportSummaryTool,
  SolanaFetchTokenDetailedReportTool,
  Solana3LandCreateSingle,
  Solana3LandCreateCollection,
  SolanaPerpOpenTradeTool,
  SolanaPerpCloseTradeTool,
  SolanaFlashOpenTrade,
  SolanaFlashCloseTrade,
  SolanaCreate2by2Multisig,
  SolanaDepositTo2by2Multisig,
  SolanaTransferFrom2by2Multisig,
  SolanaCreateProposal2by2Multisig,
  SolanaApproveProposal2by2Multisig,
  SolanaExecuteProposal2by2Multisig,
  SolanaRejectProposal2by2Multisig,
  SolanaSendTransactionWithPriorityFee,
  SolanaHeliusWebhookTool,
  SolanaGetHeliusWebhookTool,
  SolanaDeleteHeliusWebhookTool,
  SolanaParseTransactionHeliusTool,
  SolanaGetAllAssetsByOwner,
} from "./index";

export class SolanaHeliusWebhookTool extends Tool {
  name = "create_helius_webhook";
  description = `Creates a Helius Webhook that listens to specified account addresses.

  Inputs (input is a JSON string):
  accountAddresses: string[] | string, 
    e.g. ["BVdNLvyG2DNiWAXBE9qAmc4MTQXymd5Bzfo9xrQSUzVP","Eo2ciguhMLmcTWXELuEQPdu7DWZt67LHXb2rdHZUbot7"]
    or "BVdNLvyG2DNiWAXBE9qAmc4MTQXymd5Bzfo9xrQSUzVP,Eo2ciguhMLmcTWXELuEQPdu7DWZt67LHXb2rdHZUbot7"
  webhookURL: string, e.g. "https://TestServer.test.repl.co/webhooks"`;

  constructor(private solanaKit: SolanaAgentKit) {
    super();
  }

  protected async _call(input: string): Promise<string> {
    try {
      const parsedInput = JSON.parse(input);
      let accountAddresses: string[] = [];

      if (!parsedInput.accountAddresses) {
        throw new Error('Missing "accountAddresses" property in input JSON.');
      }
      if (Array.isArray(parsedInput.accountAddresses)) {
        accountAddresses = parsedInput.accountAddresses.map((addr: string) =>
          addr.trim(),
        );
      } else if (typeof parsedInput.accountAddresses === "string") {
        accountAddresses = parsedInput.accountAddresses
          .split(",")
          .map((addr: string) => addr.trim());
      } else {
        throw new Error(
          'Invalid type for "accountAddresses". Expected array or comma-separated string.',
        );
      }

      const webhookURL = parsedInput.webhookURL;
      if (!webhookURL) {
        throw new Error(
          'Invalid input. Expected a "webhookURL" property in the JSON.',
        );
      }
      const result = await this.solanaKit.CreateWebhook(
        accountAddresses,
        webhookURL,
      );

      // Return success in JSON
      return JSON.stringify({
        status: "success",
        message: "Helius Webhook created successfully",
        webhookURL: result.webhookURL,
        webhookID: result.webhookID,
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

export class SolanaGetHeliusWebhookTool extends Tool {
  name = "get_helius_webhook";
  description = `Retrieves a Helius Webhook by its ID.

Inputs (input is a JSON string):
  webhookID: string, e.g. "1ed4244d-a591-4854-ac31-cc28d40b8255"`;

  constructor(private solanaKit: SolanaAgentKit) {
    super();
  }

  protected async _call(input: string): Promise<string> {
    try {
      const parsedInput = JSON.parse(input);

      const webhookID = parsedInput.webhookID;
      if (!webhookID || typeof webhookID !== "string") {
        throw new Error(
          'Invalid input. Expected a "webhookID" property in the JSON.',
        );
      }

      const result = await this.solanaKit.getWebhook(webhookID);
      return JSON.stringify({
        status: "success",
        message: "Helius Webhook retrieved successfully",
        wallet: result.wallet,
        webhookURL: result.webhookURL,
        transactionTypes: result.transactionTypes,
        accountAddresses: result.accountAddresses,
        webhookType: result.webhookType,
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

export class SolanaDeleteHeliusWebhookTool extends Tool {
  name = "delete_helius_webhook";
  description = `Deletes a Helius Webhook by its ID.

Inputs (input is a JSON string):
  webhookID: string, e.g. "1ed4244d-a591-4854-ac31-cc28d40b8255"`;

  constructor(private solanaKit: SolanaAgentKit) {
    super();
  }

  protected async _call(input: string): Promise<string> {
    try {
      const parsedInput = JSON.parse(input);

      const webhookID = parsedInput.webhookID;
      if (!webhookID || typeof webhookID !== "string") {
        throw new Error(
          'Invalid input. Expected a "webhookID" property in the JSON.',
        );
      }
      const result = await this.solanaKit.deleteWebhook(webhookID);

      return JSON.stringify({
        status: "success",
        message: "Helius Webhook deleted successfully",
        data: result,
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

export function createSolanaTools(solanaKit: SolanaAgentKit) {
  return [
    new SolanaBalanceTool(solanaKit),
    new SolanaBalanceOtherTool(solanaKit),
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
    new SolanaRestakeTool(solanaKit),
    new SolanaFetchPriceTool(solanaKit),
    new SolanaGetDomainTool(solanaKit),
    new SolanaTokenDataTool(solanaKit),
    new SolanaTokenDataByTickerTool(solanaKit),
    new SolanaCompressedAirdropTool(solanaKit),
    new SolanaRaydiumCreateAmmV4(solanaKit),
    new SolanaRaydiumCreateClmm(solanaKit),
    new SolanaRaydiumCreateCpmm(solanaKit),
    new SolanaOpenbookCreateMarket(solanaKit),
    new SolanaManifestCreateMarket(solanaKit),
    new SolanaLimitOrderTool(solanaKit),
    new SolanaBatchOrderTool(solanaKit),
    new SolanaCancelAllOrdersTool(solanaKit),
    new SolanaWithdrawAllTool(solanaKit),
    new SolanaClosePosition(solanaKit),
    new SolanaOrcaCreateCLMM(solanaKit),
    new SolanaOrcaCreateSingleSideLiquidityPool(solanaKit),
    new SolanaOrcaFetchPositions(solanaKit),
    new SolanaOrcaOpenCenteredPosition(solanaKit),
    new SolanaOrcaOpenSingleSidedPosition(solanaKit),
    new SolanaPythFetchPrice(solanaKit),
    new SolanaResolveDomainTool(solanaKit),
    new SolanaGetOwnedDomains(solanaKit),
    new SolanaGetOwnedTldDomains(solanaKit),
    new SolanaGetAllTlds(solanaKit),
    new SolanaGetMainDomain(solanaKit),
    new SolanaResolveAllDomainsTool(solanaKit),
    new SolanaCreateGibworkTask(solanaKit),
    new SolanaRockPaperScissorsTool(solanaKit),
    new SolanaTipLinkTool(solanaKit),
    new SolanaListNFTForSaleTool(solanaKit),
    new SolanaCancelNFTListingTool(solanaKit),
    new SolanaCloseEmptyTokenAccounts(solanaKit),
    new SolanaFetchTokenReportSummaryTool(solanaKit),
    new SolanaFetchTokenDetailedReportTool(solanaKit),
    new Solana3LandCreateSingle(solanaKit),
    new Solana3LandCreateCollection(solanaKit),
    new SolanaPerpOpenTradeTool(solanaKit),
    new SolanaPerpCloseTradeTool(solanaKit),
    new SolanaFlashOpenTrade(solanaKit),
    new SolanaFlashCloseTrade(solanaKit),
    new SolanaCreate2by2Multisig(solanaKit),
    new SolanaCreateProposal2by2Multisig(solanaKit),
    new SolanaApproveProposal2by2Multisig(solanaKit),
    new SolanaRejectProposal2by2Multisig(solanaKit),
    new SolanaExecuteProposal2by2Multisig(solanaKit),
    new SolanaDepositTo2by2Multisig(solanaKit),
    new SolanaTransferFrom2by2Multisig(solanaKit),
    new SolanaSendTransactionWithPriorityFee(solanaKit),
    new SolanaHeliusWebhookTool(solanaKit),
    new SolanaGetHeliusWebhookTool(solanaKit),
    new SolanaDeleteHeliusWebhookTool(solanaKit),
    new SolanaParseTransactionHeliusTool(solanaKit),
    new SolanaGetAllAssetsByOwner(solanaKit),
    new Solana3LandCreateSingle(solanaKit),
    new SolanaSendTransactionWithPriorityFee(solanaKit),
    new SolanaHeliusWebhookTool(solanaKit),
    new SolanaGetHeliusWebhookTool(solanaKit),
    new SolanaDeleteHeliusWebhookTool(solanaKit),
  ];
}
