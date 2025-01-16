import { SolanaAgentKit } from "../../agent";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import {
  dasApi,
  GetAssetsByAuthorityRpcInput,
} from "@metaplex-foundation/digital-asset-standard-api";

export async function get_assets_by_authority(
  agent: SolanaAgentKit,
  params: GetAssetsByAuthorityRpcInput,
) {
  const umi = createUmi(agent.connection.rpcEndpoint).use(dasApi());
  const assets = await umi.rpc.getAssetsByAuthority(params);
  return assets.items;
}
