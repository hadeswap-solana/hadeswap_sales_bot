import axios from "axios";

export default async function getSolanaUsdPrice() : Promise<number> {
    try {
        const priceString = await axios.get('https://api.binance.com/api/v3/ticker/price?symbol=SOLUSDT');
        return Math.floor(parseFloat(priceString.data.price as string) * 100) / 100;
    } catch (err) {
        return 16;
    }
}