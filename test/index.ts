import { SolanaAgentKit } from "../src";
import { createSolanaTools } from "../src/langchain";
import { OpenAI } from "@langchain/openai";
import { AgentExecutor } from "langchain/agents";
import { PromptTemplate } from "@langchain/core/prompts";
import { pull } from "langchain/hub";
import { createReactAgent } from "langchain/agents";
import { HumanMessage, AIMessage, BaseMessage } from "@langchain/core/messages";
import * as readline from "readline";

async function initializeAgent() {
  const solanaKit = new SolanaAgentKit(
    "5wuqAMP68kNiqs935hDfYkm9ngLzPAxWwYuk12eqVvdMVGJfaVcmYgcz8Met7w61goYubwegRJ7btEBWYsBtpubU",
    "https://mainnet.helius-rpc.com/?api-key=da5b04e7-ae1c-4474-ae18-cf81af2b0653"
  );

  // Create Solana-specific tools
  const tools = createSolanaTools(solanaKit);

  // Create an LLM Chain
  const llm = new OpenAI({
    modelName: "gpt-4o-mini",
    temperature: 0.7,
  });

  const prompt = await pull<PromptTemplate>("hwchase17/react");

  const agent = await createReactAgent({
    llm,
    tools,
    prompt,
  });

  const agentExecutor = new AgentExecutor({
    agent,
    tools,
    maxIterations: 5,
  });

  return { agentExecutor };
}

async function runAutonomousMode(
  agentExecutor: AgentExecutor,
  interval: number = 10000
) {
  console.log("Starting autonomous mode...");

  // Initialize message history
  const messageHistory: BaseMessage[] = [];

  while (true) {
    try {
      // Use the same thought prompt as in the Python example
      const thought =
        "Be creative and do something interesting on the blockchain. " +
        "Choose an action or set of actions and execute it that highlights your abilities.";

      const result = await agentExecutor.invoke({
        input: thought, // Changed from messages to input
        history: messageHistory,
        returnIntermediateSteps: true,
      });

      console.log(result);

      // Add the interaction to history
      messageHistory.push(new HumanMessage(thought));
      messageHistory.push(new AIMessage(result.output));

      console.log(result.output);
      console.log("-------------------");

      // Wait before the next action
      await new Promise((resolve) => setTimeout(resolve, interval));
    } catch (error) {
      console.error("Error in autonomous mode:", error);
      await new Promise((resolve) => setTimeout(resolve, interval));
    }
  }
}

async function runChatMode(agentExecutor: AgentExecutor) {
  console.log("Starting chat mode... Type 'exit' to end.");

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  // Initialize message history
  const messageHistory: BaseMessage[] = [];

  while (true) {
    try {
      const userInput = await new Promise<string>((resolve) => {
        rl.question("\nUser: ", resolve);
      });

      if (userInput.toLowerCase() === "exit") {
        break;
      }

      const result = await agentExecutor.invoke({
        input: userInput, // Changed from messages to input
        history: messageHistory,
      });

      // Add the interaction to history
      messageHistory.push(new HumanMessage(userInput));
      messageHistory.push(new AIMessage(result.output));

      console.log(result.output);
      console.log("-------------------");
    } catch (error) {
      console.error("Error in chat mode:", error);
    }
  }

  rl.close();
}

function chooseMode(): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  console.log("\nAvailable modes:");
  console.log("1. chat    - Interactive chat mode");
  console.log("2. auto    - Autonomous action mode");

  return new Promise((resolve) => {
    rl.question("\nChoose a mode (enter number or name): ", (answer) => {
      rl.close();
      const mode = answer.toLowerCase().trim();
      if (mode === "1" || mode === "chat") {
        resolve("chat");
      } else if (mode === "2" || mode === "auto") {
        resolve("auto");
      } else {
        console.log("Invalid choice. Defaulting to chat mode.");
        resolve("chat");
      }
    });
  });
}

async function main() {
  console.log("Starting Agent...");
  const { agentExecutor } = await initializeAgent();

  const mode = await chooseMode();
  if (mode === "chat") {
    await runChatMode(agentExecutor);
  } else {
    await runAutonomousMode(agentExecutor);
  }
}

// Handle Ctrl+C gracefully
process.on("SIGINT", () => {
  console.log("\nGoodbye Agent!");
  process.exit(0);
});

// Start the agent
main().catch(console.error);
