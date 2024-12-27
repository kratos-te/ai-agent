import { StateGraph } from "@langchain/langgraph";
import { solanaAgentState } from "./utils/state";
import { generalistNode } from "./agents/generalAgent";
import { transferSwapNode } from "./agents/transferOrSwap";
import { managerNode } from "./agents/manager";
import { START, END } from "@langchain/langgraph";
import { managerRouter } from "./utils/route";
import { HumanMessage } from "@langchain/core/messages";

const workflow = new StateGraph(solanaAgentState)
  .addNode("generalist", generalistNode)
  .addNode("manager", managerNode)
  .addNode("transferSwap", transferSwapNode)
  .addEdge(START, "manager")
  .addConditionalEdges("manager", managerRouter)
  .addEdge("generalist", END)
  .addEdge("transferSwap", END);

export const graph = workflow.compile();

const result = await graph.invoke({
  messages: [new HumanMessage("swap 0.1 usdc to sol")],
});

console.log(result);
