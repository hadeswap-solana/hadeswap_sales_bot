import axios from "axios";

export default async function getSolanaUsdPrice() : Promise<number> {
    try {
        const priceString = await axios.get('https://api.coingecko.com/api/v3/simple/price',{
            params: { ids: 'solana', vs_currencies: 'usd' },
        });
        return Math.floor(parseFloat(priceString.data?.solana?.usd) * 100) / 100;
    } catch (err) {
        console.error(err);
        return 11;
    }
}