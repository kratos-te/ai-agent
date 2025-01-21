import { SolanaAgentKit } from "../../index";
import OpenAI from "openai";
import { ChatCompletionMessageParam } from "openai/resources";

/**
 * Generate an image using OpenAI's DALL-E
 * @param agent SolanaAgentKit instance
 * @param prompt Text description of the image to generate
 * @param size Image size ('256x256', '512x512', or '1024x1024') (default: '1024x1024')
 * @param n Number of images to generate (default: 1)
 * @returns Object containing the generated image URLs
 */
export async function get_info(agent: SolanaAgentKit, prompt: string) {
  try {
    if (!agent.config.PERPLEXITY_API_KEY) {
      throw new Error("Perplexity API key not found in agent configuration");
    }

    const perplexity = new OpenAI({
      apiKey: agent.config.PERPLEXITY_API_KEY,
      baseURL: "https://api.perplexity.ai",
    });

    const messages: ChatCompletionMessageParam[] = [
      {
        role: "system",
        content:
          "You are an artificial intelligence assistant and you need to " +
          "engage in a helpful, detailed, polite conversation with a user.",
      },
      {
        role: "user",
        content: prompt,
      },
    ];

    const response = await perplexity.chat.completions.create({
      model: "llama-3.1-sonar-large-128k-online",
      messages,
    });

    return response.choices[0].message.content;
  } catch (error: any) {
    console.error(error);
    throw new Error(`Perplexity failed: ${error.message}`);
  }
}
