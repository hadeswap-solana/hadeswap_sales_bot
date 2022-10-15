import {metaplex} from "../constants/index.js";
import {PublicKey} from "@solana/web3.js";
import axios from 'axios';

export type LightNft = {
    image: string,
    name: string,
    royalties: number,
}

export default async function getNftMetadata(
    mintAddress: string
) : Promise<LightNft> {
    const nft = await metaplex.nfts().findByMint({
        mintAddress: new PublicKey(mintAddress),
        loadJsonMetadata: true,
        commitment: "confirmed"
    }).run();

    if (nft.json) {
        return {
            image: nft.json.image || "",
            name: nft.name,
            royalties: nft.sellerFeeBasisPoints,
        }
    } else {
        const json = await axios.get(nft.uri);
        return {
            name: nft.name,
            image: json.data.image,
            royalties: nft.sellerFeeBasisPoints,
        }
    }
}