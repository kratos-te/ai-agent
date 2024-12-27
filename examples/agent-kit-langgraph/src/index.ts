import { StateGraph } from "@langchain/langgraph";
import { solanaAgentState } from "./utils/state";

const workflow = new StateGraph(solanaAgentState);

export const graph = workflow.compile();
