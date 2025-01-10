import { z } from "zod";
import type { Action } from "../../types";
import { getVaultInfo } from "../../tools";
import type { SolanaAgentKit } from "../../agent";
import { decodeName } from "@drift-labs/vaults-sdk";
import { MainnetSpotMarkets, PERCENTAGE_PRECISION } from "@drift-labs/sdk";

const vaultInfoAction: Action = {
  name: "DRIFT_VAULT_INFO",
  similes: ["get drift vault info", "vault info", "vault information"],
  description: "Get information about a drift vault",
  examples: [
    [
      {
        input: {
          vaultAddress: "2nFeP7taii",
        },
        output: {
          status: "success",
          message: "Vault info retrieved successfully",
          data: {
            name: "My Drift Vault",
            marketName: "SOL-SPOT",
            redeemPeriod: 30,
            maxTokens: 1000,
            minDepositAmount: 100,
            managementFee: 10,
            profitShare: 5,
            hurdleRate: 0.1,
            permissioned: false,
          },
        },
        explanation: "Get information about a drift vault",
      },
    ],
  ],
  schema: z.object({
    vaultAddress: z.string(),
  }),
  handler: async (agent: SolanaAgentKit, input) => {
    try {
      const vaultInfo = await getVaultInfo(agent, input.vaultAddress as string);
      const spotToken = MainnetSpotMarkets[vaultInfo.spotMarketIndex];
      const data = {
        name: decodeName(vaultInfo.name),
        marketName: `${spotToken.symbol}-SPOT`,
        redeemPeriod: vaultInfo.redeemPeriod.toNumber(),
        maxTokens: vaultInfo.maxTokens.div(spotToken.precision).toNumber(),
        minDepositAmount: vaultInfo.minDepositAmount
          .div(spotToken.precision)
          .toNumber(),
        managementFee:
          (vaultInfo.managementFee.toNumber() /
            PERCENTAGE_PRECISION.toNumber()) *
          100,
        profitShare:
          (vaultInfo.profitShare / PERCENTAGE_PRECISION.toNumber()) * 100,
        hurdleRate:
          (vaultInfo.hurdleRate / PERCENTAGE_PRECISION.toNumber()) * 100,
        permissioned: vaultInfo.permissioned,
      };

      return {
        status: "success",
        message: "Vault info retrieved successfully",
        data,
      };
    } catch (e) {
      return {
        status: "error",
        // @ts-expect-error - error message
        message: `Failed to retrieve vault info: ${e.message}`,
      };
    }
  },
};

export default vaultInfoAction;
