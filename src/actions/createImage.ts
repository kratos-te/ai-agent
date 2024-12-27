import { Action } from "../types/action";
import { SolanaAgentKit } from "../agent";
import { z } from "zod";
import OpenAI from "openai";

const createImageAction: Action = {
  name: "solana_create_image",
  similes: [
    "generate image",
    "create artwork",
    "make image",
    "generate artwork",
    "create picture",
    "generate picture"
  ],
  description: "Create an AI-generated image based on a text prompt using OpenAI's DALL-E models",
  examples: [
    [
      {
        input: {
          prompt: "A beautiful sunset over a mountain landscape",
          model: "dall-e-3",
          size: "1024x1024",
          quality: "standard",
          style: "natural"
        },
        output: {
          status: "success",
          imageUrl: "https://example.com/image.png",
          message: "Successfully generated image"
        },
        explanation: "Generate an image of a sunset landscape using DALL-E 3"
      }
    ]
  ],
  schema: z.object({
    prompt: z.string()
      .min(1)
      .max(1000)
      .describe("The text description of the image to generate"),
    model: z.enum(["dall-e-3"])
      .default("dall-e-3")
      .describe("The AI model to use for generation"),
    size: z.enum(["256x256", "512x512", "1024x1024", "1792x1024", "1024x1792"])
      .default("1024x1024")
      .describe("The size of the generated image"),
    quality: z.enum(["standard", "hd"])
      .default("standard")
      .describe("The quality level of the generated image"),
    style: z.enum(["natural", "vivid"])
      .default("natural")
      .describe("The style of the generated image")
  }),
  handler: async (agent: SolanaAgentKit, input: Record<string, any>) => {
    try {
      if (!agent.openai_api_key) {
        return {
          status: "error",
          message: "OpenAI API key not found in agent configuration"
        };
      }

      const { prompt, model, size, quality, style } = input;

      const openai = new OpenAI({
        apiKey: agent.openai_api_key
      });

      const response = await openai.images.generate({
        prompt,
        model,
        n: 1,
        size,
        quality,
        style
      });

      if (!response.data || response.data.length === 0) {
        return {
          status: "error",
          message: "No image was generated"
        };
      }

      return {
        status: "success",
        imageUrl: response.data[0].url,
        message: "Successfully generated image"
      };
    } catch (error: any) {
      // Handle specific OpenAI error types
      if (error.response) {
        const { status, data } = error.response;
        if (status === 429) {
          return {
            status: "error",
            message: "Rate limit exceeded. Please try again later."
          };
        }
        return {
          status: "error",
          message: `OpenAI API error: ${data.error?.message || error.message}`
        };
      }

      return {
        status: "error",
        message: `Failed to generate image: ${error.message}`
      };
    }
  }
};

export default createImageAction; 