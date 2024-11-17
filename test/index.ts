import { SolanaAgentKit } from "../src";
import { createSolanaTools } from "../src/langchain";
import { OpenAI } from "@langchain/openai";
import { AgentExecutor } from "langchain/agents";
import { PromptTemplate } from "@langchain/core/prompts";
import { pull } from "langchain/hub";
import { createReactAgent } from "langchain/agents";

// Initialize SolanaAgentKit
const solanaKit = new SolanaAgentKit(
  "2bsq2EHutvSvZenGiFSqg4AKMBCP2gB1LnkRiavS4SHKZs4FnDSkGy9c2quiTBuSoKTn9AKV82P1E5D8mkiHJuEW"
);

// Create Solana-specific tools
const tools = createSolanaTools(solanaKit);


(async () => {
  // Define a Prompt Template for the Agent
  const prompt = await pull<PromptTemplate>("hwchase17/react");

  // Create an LLM Chain
  const llm = new OpenAI({
    modelName: "gpt-4o-mini",
    temperature: 0,
  });

  const agent = await createReactAgent({
    llm,
    tools,
    prompt,
  });

  const agentExecutor = new AgentExecutor({
    agent,
    tools,
  });

  const result = await agentExecutor.invoke({
    input:
      "What is your wallet address?",
  });

  console.log(result);
})();
