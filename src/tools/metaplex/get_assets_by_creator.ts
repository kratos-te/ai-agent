import { SolanaAgentKit } from "../../agent";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import {
  dasApi,
  GetAssetsByCreatorRpcInput,
} from "@metaplex-foundation/digital-asset-standard-api";

export async function get_assets_by_creator(
  agent: SolanaAgentKit,
  params: GetAssetsByCreatorRpcInput,
) {
  const umi = createUmi(agent.connection.rpcEndpoint).use(dasApi());
  return await umi.rpc.getAssetsByCreator(params);
}
