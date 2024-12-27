import { SolanaAgentKit } from "../../../src/agent";

export const agentKit = new SolanaAgentKit(
  process.env.SOLANA_PRIVATE_KEY!,
  process.env.RPC_URL!,
  process.env.OPENAI_API_KEY!,
);
