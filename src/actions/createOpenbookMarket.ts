import { Action } from "../types/action";
import { SolanaAgentKit } from "../agent";
import { z } from "zod";
import { OPEN_BOOK_PROGRAM, Raydium, TxVersion } from "@raydium-io/raydium-sdk-v2";
import { MintLayout, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { PublicKey } from "@solana/web3.js";

const createOpenbookMarketAction: Action = {
  name: "solana_create_openbook_market",
  similes: [
    "create openbook market",
    "setup trading market",
    "new openbook market",
    "create trading pair",
    "setup dex market",
    "new trading market"
  ],
  description: "Create a new trading market on Openbook DEX",
  examples: [
    [
      {
        input: {
          baseMint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",  // USDC
          quoteMint: "So11111111111111111111111111111111111111112",   // SOL
          lotSize: 1,
          tickSize: 0.01
        },
        output: {
          status: "success",
          signatures: ["2ZE7Rz...", "3YKpM1..."],
          message: "Successfully created Openbook market"
        },
        explanation: "Create a new USDC/SOL market on Openbook with default lot and tick sizes"
      }
    ]
  ],
  schema: z.object({
    baseMint: z.string()
      .min(1)
      .describe("The base token's mint address"),
    quoteMint: z.string()
      .min(1)
      .describe("The quote token's mint address"),
    lotSize: z.number()
      .positive()
      .default(1)
      .describe("The minimum order size (lot size)"),
    tickSize: z.number()
      .positive()
      .default(0.01)
      .describe("The minimum price increment (tick size)")
  }),
  handler: async (agent: SolanaAgentKit, input: Record<string, any>) => {
    try {
      const baseMint = new PublicKey(input.baseMint);
      const quoteMint = new PublicKey(input.quoteMint);
      const lotSize = input.lotSize || 1;
      const tickSize = input.tickSize || 0.01;

      const raydium = await Raydium.load({
        owner: agent.wallet,
        connection: agent.connection,
      });

      // Get mint info
      const baseMintInfo = await agent.connection.getAccountInfo(baseMint);
      const quoteMintInfo = await agent.connection.getAccountInfo(quoteMint);

      if (!baseMintInfo || !quoteMintInfo) {
        return {
          status: "error",
          message: "Failed to fetch mint information"
        };
      }

      // Verify token program
      if (
        baseMintInfo.owner.toString() !== TOKEN_PROGRAM_ID.toBase58() ||
        quoteMintInfo.owner.toString() !== TOKEN_PROGRAM_ID.toBase58()
      ) {
        return {
          status: "error",
          message: "Openbook market only supports TOKEN_PROGRAM_ID mints. For token-2022, please use Raydium CPMM pool instead."
        };
      }

      // Create market
      const { execute } = await raydium.marketV2.create({
        baseInfo: {
          mint: baseMint,
          decimals: MintLayout.decode(baseMintInfo.data).decimals,
        },
        quoteInfo: {
          mint: quoteMint,
          decimals: MintLayout.decode(quoteMintInfo.data).decimals,
        },
        lotSize,
        tickSize,
        dexProgramId: OPEN_BOOK_PROGRAM,
        txVersion: TxVersion.V0,
      });

      const { txIds } = await execute({ sequentially: true });

      return {
        status: "success",
        signatures: txIds,
        message: "Successfully created Openbook market"
      };
    } catch (error: any) {
      return {
        status: "error",
        message: `Failed to create Openbook market: ${error.message}`
      };
    }
  }
};

export default createOpenbookMarketAction; 