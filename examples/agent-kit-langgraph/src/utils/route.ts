import { solanaAgentState } from "./state";
import { END } from "@langchain/langgraph";

export const managerRouter = (state: typeof solanaAgentState.State) => {
  const { isSolanaReadQuery, isSolanaWriteQuery, isGeneralQuery } = state;

  if (isGeneralQuery) {
    return "generalist";
  } else if (isSolanaWriteQuery) {
    return "transferSwap";
  } else {
    return END;
  }
};
