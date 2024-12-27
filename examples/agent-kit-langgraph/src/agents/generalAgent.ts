import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { gpt4o } from "../utils/model.js";
import { solanaAgentState } from "../utils/state.js";
import { TavilySearchResults } from "@langchain/community/tools/tavily_search";
import { HumanMessage } from "@langchain/core/messages";

// Initialize tools array
const searchTools = [];

// Only add Tavily search if API key is available
if (process.env.TAVILY_API_KEY) {
  searchTools.push(new TavilySearchResults());
}

export const generalAgent = createReactAgent({
  llm: gpt4o,
  tools: searchTools,
});

export const generalistNode = async (state: typeof solanaAgentState.State) => {
  const { messages } = state;

  const result = await generalAgent.invoke({ messages });

  return { messages: [...result.messages] };
};

const messages = [new HumanMessage("What is the best way to buy SOL?")];

const result = await generalAgent.invoke({ messages });

console.log(result.messages);
