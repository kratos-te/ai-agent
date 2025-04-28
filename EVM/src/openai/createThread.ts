import OpenAI from "openai";
import { Thread } from "openai/resources/beta/threads/threads";
/**
 * Creates a new thread with an optional initial message.
 * @param client The OpenAI client to use.
 * @param message The initial message to send to the thread, or undefined if no initial message should be sent.
 * @returns The newly created thread.
 */
export async function createThread(
  client: OpenAI,
  message?: string
): Promise<Thread> {
  // Create a new thread
  const thread = await client.beta.threads.create();

  // If an initial message was provided, send it to the thread
  if (message) {
    await client.beta.threads.messages.create(thread.id, {
      role: "user",
      content: message,
    });
  }

  // Return the newly created thread
  return thread;
}
