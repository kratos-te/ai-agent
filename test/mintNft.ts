import { SolanaAgentKit } from "../src";
import { deploy_collection, mintCollectionNFT } from "../src/tools";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { fromWeb3JsPublicKey } from "@metaplex-foundation/umi-web3js-adapters";
import assert from "assert";
import { fetchAsset, fetchCollection, mplCore } from "@metaplex-foundation/mpl-core";

export async function test_mint_nft() {
    console.log("<<< Test Mint NFT");
    const solanaKit = new SolanaAgentKit(
        process.env.SOLANA_PRIVATE_KEY!,
        process.env.RPC_URL,
        process.env.OPENAI_API_KEY!
    );

    const umi = createUmi(solanaKit.connection.rpcEndpoint).use(mplCore());

    const { collectionAddress } = await deploy_collection(solanaKit, {
        name: "test",
        uri: "www.example.com",
    });

    const assetAddress = fromWeb3JsPublicKey(((await mintCollectionNFT(solanaKit, collectionAddress, {
        name: "test",
        uri: "www.example.com"
    })).mint));

    // Delay for 5 seconds
    await new Promise(resolve => setTimeout(resolve, 5000));

    const asset = await fetchAsset(umi, assetAddress, { commitment: 'processed' });
    assert(asset.name === "test");
    assert(asset.uri === "www.example.com");
    assert(asset.publicKey === assetAddress);
    assert(asset.updateAuthority.address === fromWeb3JsPublicKey(collectionAddress));

    const collection = await fetchCollection(umi, fromWeb3JsPublicKey(collectionAddress), { commitment: 'processed' });
    assert(collection.numMinted === 1);

    console.log(">>> Test Mint NFT Passed");
}

