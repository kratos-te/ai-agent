import { Action } from "../../types/action";
import { SolanaAgentKit } from "../../agent";
import { z } from "zod";
import { get_assets_by_authority } from "../../tools/metaplex";

const getAssetByAuthorityAction: Action = {
  name: "GET_ASSET_BY_AUTHORITY",
  similes: [
    "fetch assets by authority",
    "retrieve assets by authority",
    "get assets by authority address",
    "fetch authority assets",
  ],
  description: `Fetch a list of assets owned by a specific address using the Metaplex DAS API.`,
  examples: [
    [
      {
        input: {
          authorityAddress: "mRdta4rc2RtsxEUDYuvKLamMZAdW6qHcwuq866Skxxv",
          limit: 10,
        },
        output: {
          status: "success",
          message: "Assets retrieved successfully",
          result: [
            // Example asset details
            {
              name: "Example Asset 1",
              symbol: "EXA1",
              uri: "https://example.com/asset1.json",
            },
            {
              name: "Example Asset 2",
              symbol: "EXA2",
              uri: "https://example.com/asset2.json",
            },
          ],
        },
        explanation: "Fetch a list of assets owned by a specific address",
      },
    ],
  ],
  schema: z.object({
    authorityAddress: z.string().min(1, "Authority address is required"),
    sortBy: z
      .object({
        sortBy: z.enum(["created", "updated", "recentAction", "none"]),
        sortDirection: z.enum(["asc", "desc"]),
      })
      .optional(),
    limit: z.number().optional(),
    page: z.number().optional(),
    before: z.string().optional(),
    after: z.string().optional(),
  }),
  handler: async (
    agent: SolanaAgentKit,
    input: z.infer<typeof getAssetByAuthorityAction.schema>,
  ) => {
    const result = await get_assets_by_authority(agent, input);

    return {
      status: "success",
      message: "Assets retrieved successfully",
      result,
    };
  },
};

export default getAssetByAuthorityAction;
