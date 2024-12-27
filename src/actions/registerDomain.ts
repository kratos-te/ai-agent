import { Action } from "../types/action";
import { SolanaAgentKit } from "../agent";
import { z } from "zod";
import { Transaction } from "@solana/web3.js";
import { registerDomainNameV2 } from "@bonfida/spl-name-service";
import { getAssociatedTokenAddressSync } from "@solana/spl-token";
import { TOKENS } from "../constants";

const registerDomainAction: Action = {
  name: "solana_register_domain",
  similes: [
    "register domain",
    "buy domain",
    "get domain name",
    "register .sol",
    "purchase domain",
    "domain registration"
  ],
  description: "Register a .sol domain name using Bonfida Name Service",
  examples: [
    [
      {
        input: {
          name: "mydomain",
          spaceKB: 1
        },
        output: {
          status: "success",
          signature: "2ZE7Rz...",
          message: "Successfully registered mydomain.sol"
        },
        explanation: "Register a new .sol domain with 1KB storage space"
      }
    ]
  ],
  schema: z.object({
    name: z.string()
      .min(1)
      .describe("Domain name to register (without .sol)"),
    spaceKB: z.number()
      .min(1)
      .max(10)
      .default(1)
      .describe("Space allocation in KB (max 10KB)")
  }),
  handler: async (agent: SolanaAgentKit, input: Record<string, any>) => {
    try {
      const name = input.name as string;
      const spaceKB = (input.spaceKB as number) || 1;

      // Validate space size
      if (spaceKB > 10) {
        return {
          status: "error",
          message: "Maximum domain size is 10KB"
        };
      }

      // Convert KB to bytes
      const space = spaceKB * 1_000;

      const buyerTokenAccount = await getAssociatedTokenAddressSync(
        agent.wallet_address,
        TOKENS.USDC
      );

      // Create registration instruction
      const instruction = await registerDomainNameV2(
        agent.connection,
        name,
        space,
        agent.wallet_address,
        buyerTokenAccount
      );

      // Create and sign transaction
      const transaction = new Transaction().add(...instruction);
      transaction.recentBlockhash = (
        await agent.connection.getLatestBlockhash()
      ).blockhash;
      transaction.feePayer = agent.wallet_address;

      // Sign and send transaction
      const signature = await agent.connection.sendTransaction(transaction, [
        agent.wallet
      ]);

      // Wait for confirmation
      const latestBlockhash = await agent.connection.getLatestBlockhash();
      await agent.connection.confirmTransaction({
        signature,
        blockhash: latestBlockhash.blockhash,
        lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
      });

      return {
        status: "success",
        signature,
        message: `Successfully registered ${name}.sol`
      };
    } catch (error: any) {
      return {
        status: "error",
        message: `Domain registration failed: ${error.message}`
      };
    }
  }
};

export default registerDomainAction; 