import OpenAI from "openai";
import type { Assistant } from "openai/resources/beta/assistants";
import { tools } from "../../tools/allTools";
import { assistantPrompt } from "../constants/prompt";

/**
 * Creates a new assistant with the specified model, name, instructions and tools.
 * @param client The OpenAI client to use to create the assistant.
 * @returns The newly created assistant.
 */
export async function createAssistant(client: OpenAI): Promise<Assistant> {
  // Create the assistant with the specified model, name, instructions and tools.
  return await client.beta.assistants.create({
    // The model to use for the assistant.
    model: "gpt-4o-mini",
    // The name of the assistant.
    name: "Darth Vader",
    // The instructions to provide to the assistant.
    instructions: assistantPrompt,
    // The tools to provide to the assistant.
    tools: Object.values(tools).map((tool) => tool.definition),
  });
}
