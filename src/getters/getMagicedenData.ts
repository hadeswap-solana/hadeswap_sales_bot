import axios from "axios";
import {LAMPORTS_PER_SOL} from "@solana/web3.js";

export type MagicedenData = {
    collection: string,
    floorPrice: number,
}

export default async function getMagicedenData(
    mintAddress: string,
) : Promise<MagicedenData> {
    const nftData = await axios.get(`https://api-mainnet.magiceden.dev/v2/tokens/${mintAddress}`);
    const { collection } : { collection: string } = nftData.data;
    const collectionData = await axios.get(`https://api-mainnet.magiceden.dev/v2/collections/${collection}/stats`);

    return {
        floorPrice: (collectionData.data.floorPrice as number) / LAMPORTS_PER_SOL,
        collection: collection,
    };
}