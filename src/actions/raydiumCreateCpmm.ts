import { Action } from "../types/action";
import { SolanaAgentKit } from "../agent";
import { z } from "zod";
import {
  CREATE_CPMM_POOL_FEE_ACC,
  CREATE_CPMM_POOL_PROGRAM,
  Raydium,
  TxVersion,
} from "@raydium-io/raydium-sdk-v2";
import { MintLayout } from "@solana/spl-token";
import { PublicKey } from "@solana/web3.js";
import BN from "bn.js";

const raydiumCreateCpmmAction: Action = {
  name: "solana_raydium_create_cpmm",
  similes: [
    "create raydium pool",
    "setup raydium liquidity pool",
    "initialize raydium amm",
    "create constant product market maker",
    "setup raydium cpmm",
    "create raydium trading pair"
  ],
  description: "Create a new Constant Product Market Maker (CPMM) pool on Raydium",
  examples: [
    [
      {
        input: {
          baseMint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",  // USDC
          quoteMint: "So11111111111111111111111111111111111111112",   // SOL
          baseAmount: 1000,
          quoteAmount: 10,
          startTime: 1672531200  // Unix timestamp
        },
        output: {
          status: "success",
          signature: "2ZE7Rz...",
          poolId: "7nxQB...",
          message: "Successfully created Raydium CPMM pool"
        },
        explanation: "Create a USDC-SOL pool with initial liquidity of 1000 USDC and 10 SOL"
      }
    ]
  ],
  schema: z.object({
    baseMint: z.string()
      .min(1)
      .describe("The base token mint address"),
    quoteMint: z.string()
      .min(1)
      .describe("The quote token mint address"),
    baseAmount: z.number()
      .positive()
      .describe("Initial base token amount to provide as liquidity"),
    quoteAmount: z.number()
      .positive()
      .describe("Initial quote token amount to provide as liquidity"),
    startTime: z.number()
      .positive()
      .describe("Unix timestamp when trading should start")
  }),
  handler: async (agent: SolanaAgentKit, input: Record<string, any>) => {
    try {
      const mintA = new PublicKey(input.baseMint);
      const mintB = new PublicKey(input.quoteMint);
      const configId = new PublicKey(input.configId);
      const mintAAmount = new BN(input.baseAmount);
      const mintBAmount = new BN(input.quoteAmount);
      const startTime = new BN(input.startTime);

      const raydium = await Raydium.load({
        owner: agent.wallet,
        connection: agent.connection,
      });

      const [mintInfoA, mintInfoB] = await agent.connection.getMultipleAccountsInfo(
        [mintA, mintB],
      );
      if (mintInfoA === null || mintInfoB === null) {
        throw Error("fetch mint info error");
      }

      const mintDecodeInfoA = MintLayout.decode(mintInfoA.data);
      const mintDecodeInfoB = MintLayout.decode(mintInfoB.data);

      const mintFormatInfoA = {
        chainId: 101,
        address: mintA.toString(),
        programId: mintInfoA.owner.toString(),
        logoURI: "",
        symbol: "",
        name: "",
        decimals: mintDecodeInfoA.decimals,
        tags: [],
        extensions: {},
      };
      const mintFormatInfoB = {
        chainId: 101,
        address: mintB.toString(),
        programId: mintInfoB.owner.toString(),
        logoURI: "",
        symbol: "",
        name: "",
        decimals: mintDecodeInfoB.decimals,
        tags: [],
        extensions: {},
      };

      const { execute } = await raydium.cpmm.createPool({
        programId: CREATE_CPMM_POOL_PROGRAM,
        poolFeeAccount: CREATE_CPMM_POOL_FEE_ACC,
        mintA: mintFormatInfoA,
        mintB: mintFormatInfoB,
        mintAAmount,
        mintBAmount,
        startTime,
        //@ts-expect-error sdk bug
        feeConfig: { id: configId.toString() },
        associatedOnly: false,
        ownerInfo: {
          useSOLBalance: true,
        },
        txVersion: TxVersion.V0,
      });

      const { txId } = await execute({ sendAndConfirm: true });

      return {
        status: "success",
        signature: txId,
        message: "Successfully created Raydium CPMM pool"
      };
    } catch (error: any) {
      return {
        status: "error",
        message: `Failed to create CPMM pool: ${error.message}`
      };
    }
  }
};

export default raydiumCreateCpmmAction; 