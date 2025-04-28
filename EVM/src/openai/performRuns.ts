import OpenAI from "openai";
import type { Thread } from "openai/resources/beta/threads/threads";
import type { Run } from "openai/resources/beta/threads/runs/runs";
import { handleRunToolCalls } from "./handleRunCalls.js";

/**
 * Perform a run by handling tool calls and checking the run's status.
 * @param run The run to perform.
 * @param client The OpenAI client to use.
 * @param thread The thread the run belongs to.
 * @returns The result of the run, or an error message if the run failed.
 */
export async function performRun(run: Run, client: OpenAI, thread: Thread) {
  console.log(`🚀 Performing run ${run.id}`);

  // Keep performing the run until it's complete
  while (run.status === "requires_action") {
    // Handle any tool calls the run needs
    run = await handleRunToolCalls(run, client, thread);
  }

  // If the run failed, return an error message
  if (run.status === "failed") {
    const errorMessage = `I encountered an error: ${
      run.last_error?.message || "Unknown error"
    }`;
    console.error("Run failed:", run.last_error);
    await client.beta.threads.messages.create(thread.id, {
      role: "assistant",
      content: errorMessage,
    });
    return {
      type: "text",
      text: {
        value: errorMessage,
        annotations: [],
      },
    };
  }

  // Get the latest assistant message in the thread
  const messages = await client.beta.threads.messages.list(thread.id);
  const assistantMessage = messages.data.find(
    (message) => message.role === "assistant"
  );

  console.log(`🚀 Assistant message: ${assistantMessage?.content[0]}`);

  // Return the assistant message, or a default message if none was found
  return (
    assistantMessage?.content[0] || {
      type: "text",
      text: { value: "No response from assistant", annotations: [] },
    }
  );
}
