import { SolanaAgentKit } from "../src";
import { deploy_collection } from "../src/tools";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { fromWeb3JsPublicKey } from "@metaplex-foundation/umi-web3js-adapters";
import assert from "assert";
import { fetchCollection, mplCore } from "@metaplex-foundation/mpl-core";

export async function test_deploy_collection() {
    console.log("<<< Test Deploy Collection");
    const solanaKit = new SolanaAgentKit(
        process.env.SOLANA_PRIVATE_KEY!,
        process.env.RPC_URL,
        process.env.OPENAI_API_KEY!
    );

    const umi = createUmi(solanaKit.connection.rpcEndpoint).use(mplCore());

    const collectionAddress = fromWeb3JsPublicKey((await deploy_collection(solanaKit, {
        name: "test",
        uri: "www.example.com",
    })).collectionAddress);

    const collection = await fetchCollection(umi, collectionAddress, { commitment: 'processed' });
    assert(collection.name === "test");
    assert(collection.uri === "www.example.com");
    assert(collection.publicKey === collectionAddress);
    assert(collection.numMinted === 0);
    console.log(">>> Test Deploy Collection Passed");
}

