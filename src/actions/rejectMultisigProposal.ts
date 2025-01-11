import { Action } from "../types/action";
import { SolanaAgentKit } from "../agent";
import { z } from "zod";
import { multisig_reject_proposal } from "../tools";

const rejectMultisigProposalAction: Action = {
  name: "REJECT_MULTISIG_PROPOSAL_ACTION",
  similes: [
    "reject proposal",
    "reject proposal to transfer funds",
    "reject proposal to transfer funds from 2-of-2 multisig",
    "reject proposal to transfer funds from 2-of-2 multisig account",
    "reject proposal to transfer funds from 2-of-2 multisig account on Solana",
  ],
  description: `Reject a proposal to transfer funds from a 2-of-2 multisig account on Solana with the user and the agent, where both approvals will be required to run the transactions.`,
  examples: [
    [
      {
        input: {
          transactionIndex: 0,
        },
        output: {
          status: "success",
          message: "Proposal rejected successfully",
          transaction: "4xKpN2...",
          transactionIndex: "0",
        },
        explanation:
          "Reject a proposal to transfer 1 SOL from 2-of-2 multisig account on Solana",
      },
    ],
  ],
  schema: z.object({
    transactionIndex: z.number().optional(),
  }),
  handler: async (agent: SolanaAgentKit, input: Record<string, any>) => {
    const transactionIndex =
      input.transactionIndex !== undefined
        ? Number(input.transactionIndex)
        : undefined;

    const tx = await multisig_reject_proposal(agent, transactionIndex);

    return {
      status: "success",
      message: "Proposal rejected successfully",
      transaction: tx,
      transactionIndex: transactionIndex,
    };
  },
};

export default rejectMultisigProposalAction;
