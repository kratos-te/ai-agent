import { fetchDigitalAsset, mplTokenMetadata } from "@metaplex-foundation/mpl-token-metadata";
import { SolanaAgentKit } from "../src";
import { deploy_token } from "../src/tools";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { fromWeb3JsPublicKey } from "@metaplex-foundation/umi-web3js-adapters";
import assert from "assert";

export async function test_deploy_token() {
    console.log("<<< Test Deploy Token");
    const solanaKit = new SolanaAgentKit(
        process.env.SOLANA_PRIVATE_KEY!,
        process.env.RPC_URL,
        process.env.OPENAI_API_KEY!
    );

    const umi = createUmi(solanaKit.connection.rpcEndpoint).use(mplTokenMetadata());

    const mint = fromWeb3JsPublicKey((await deploy_token(solanaKit, 6, "test", "www.example.com", "TEST")).mint);

    // Delay for 5 seconds
    await new Promise(resolve => setTimeout(resolve, 5000));

    const asset = await fetchDigitalAsset(umi, mint, { commitment: 'processed' });
    assert(asset.metadata.name === "test");
    assert(asset.metadata.uri === "www.example.com");
    assert(asset.metadata.symbol === 'TEST');
    assert(asset.metadata.sellerFeeBasisPoints === 0);
    assert(asset.metadata.mint === mint);
    assert(asset.metadata.sellerFeeBasisPoints === 0);
    console.log(">>> Test Deploy Token Passed");
}

