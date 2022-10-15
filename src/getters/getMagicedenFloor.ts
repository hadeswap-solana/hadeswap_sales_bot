import axios from "axios";
import {LAMPORTS_PER_SOL} from "@solana/web3.js";

export default async function getMagicedenFloor(
    mintAddress: string,
) : Promise<number> {
    const nftData = await axios.get(`https://api-mainnet.magiceden.dev/v2/tokens/${mintAddress}`);
    const { collection } : { collection: string } = nftData.data;
    const collectionData = await axios.get(`https://api-mainnet.magiceden.dev/v2/collections/${collection}/stats`);

    return (collectionData.data.floorPrice as number) / LAMPORTS_PER_SOL;
}