import axios from "axios";

type Rarity = {
    api_version: "0.1",
    result: {
        api_code: number,
        api_response: string,
        data: {
            collection: string,
            official_rarity: number,
            ranking_url: string,
            items: [
                {
                    id: string,
                    mint: string,
                    link: string,
                    rank: number,
                    rank_algo: string,
                    all_ranks: any
                }
            ]
        }
    }
}


export default async function getRarity(
    mint: string,
    collection: string,
) : Promise<{ rarity: number, size: number } | undefined> {
    const url = `https://api.howrare.is/v0.1/collections/${collection}/only_rarity`;

    const rarityReq = await axios.get(url);
    const nftWithRarity = (rarityReq.data as Rarity).result.data.items.find(item => item.mint === mint);

    return nftWithRarity ? {
        rarity: nftWithRarity.rank,
        size: (rarityReq.data as Rarity).result.data.items.length
    } : undefined;
}