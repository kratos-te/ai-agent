import OpenAI from "openai";
import type { Run } from "openai/resources/beta/threads/runs/runs";
import type { Thread } from "openai/resources/beta/threads/threads";
import { tools } from "../../tools/allTools";

/**
 * Handles tool calls in a run by executing the tools and submitting the
 * results back to the run.
 * @param run The run to handle tool calls for.
 * @param client The OpenAI client to use.
 * @param thread The thread the run belongs to.
 * @returns The run with the tool call outputs submitted.
 */
export async function handleRunToolCalls(
  run: Run,
  client: OpenAI,
  thread: Thread
): Promise<Run> {
  const toolCalls = run.required_action?.submit_tool_outputs?.tool_calls;

  if (!toolCalls) return run;

  const toolOutputs = await Promise.all(
    toolCalls.map(async (tool) => {
      const toolConfig = tools[tool.function.name];
      if (!toolConfig) {
        console.error(`Tool ${tool.function.name} not found`);
        return null;
      }

      console.log(`💾 Executing: ${tool.function.name}`);

      try {
        // Parse the tool arguments from a JSON string
        const args = JSON.parse(tool.function.arguments);
        // Execute the tool with the parsed arguments
        const output = await toolConfig.handler(args);
        // Return the tool output with the tool call ID
        return {
          tool_call_id: tool.id,
          output: String(output),
        };
      } catch (error) {
        // Return an error message with the tool call ID
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        return {
          tool_call_id: tool.id,
          output: `Error: ${errorMessage}`,
        };
      }
    })
  );

  // Filter out any invalid outputs
  const validOutputs = toolOutputs.filter(
    Boolean
  ) as OpenAI.Beta.Threads.Runs.RunSubmitToolOutputsParams.ToolOutput[];
  if (validOutputs.length === 0) return run;

  // Submit the valid tool call outputs back to the run
  return client.beta.threads.runs.submitToolOutputsAndPoll(thread.id, run.id, {
    tool_outputs: validOutputs,
  });
}
