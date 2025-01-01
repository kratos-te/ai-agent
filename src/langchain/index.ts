import { Tool } from "langchain/tools";
import { ACTIONS, executeAction, SolanaAgentKit } from "../index";
import { Action } from "../actions";

class ToolWrapper extends Tool {
	constructor(
		private solanaAgentKit: SolanaAgentKit,
		private action: Action,
	) {
		super();
		this.name = action.name;
		this.description = action.description;
	}

	name: string;
	description: string;

	protected async _call(
		input: typeof this.action.schema,
	): ReturnType<typeof this.action.handler> {
		return await executeAction(this.action, this.solanaAgentKit, input);
	}
}

export function createSolanaTools(solanaAgentKit: SolanaAgentKit): Tool[] {
	const tools: Tool[] = [];
	const actionKeys = Object.keys(ACTIONS);

	for (const actionKey of actionKeys) {
		const action = ACTIONS[actionKey as keyof typeof ACTIONS];
		const tool = new ToolWrapper(solanaAgentKit, action);
		tools.push(tool);
	}

	return tools;
}
