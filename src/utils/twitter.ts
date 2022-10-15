import Twit from "twit";
import * as fs from 'fs';
import {LightNft} from "../getters/getNftMetadata";
import {accessSecret, accessToken, consumerKey, consumerSecret} from "../constants/index.js";

const client = new Twit({
    consumer_key: consumerKey,
    consumer_secret: consumerSecret,
    access_token: accessToken,
    access_token_secret: accessSecret,
    strictSSL: true,
    timeout_ms: 60 * 1000
});

export async function uploadMedia(
    path: string
) : Promise<string[]> {
    const b64content = fs.readFileSync(path, { encoding: 'base64' });

    const uploadedMedia = await client.post('media/upload', { media_data: b64content });
    const { media_id_string } : { media_id_string: string } = uploadedMedia.data as { media_id_string: string };
    const altText = "Hadeswap NFT Sale Banner";

    const metadata = { media_id: media_id_string, alt_text: { text: altText } }
    await client.post('media/metadata/create', metadata);

    return [media_id_string];
}

export async function sendPostWithMedia(
    path: string,
    price: number,
    usd_price: number,
    signature: string,
    type: "Sale" | "Purchase",
    magicedenFloor: number,
    metadata: LightNft,
) : Promise<void> {
    const media = await uploadMedia(path);
    const solscanUrl = `https://solscan.io/tx/${signature}`;
    const content: string = (() => {
        let content = `🚀 New Hadeswap ${type}! \n\n${metadata.name} has been ${type === 'Sale' ? 'sold' : 'purchased'} for ${price} SOL ($${usd_price})! \n\n`;

        if (type === "Purchase") {
            if (price < magicedenFloor) {
                const difference = Math.floor((100 - (Math.floor(price / magicedenFloor * 100 * 100) / 100)) * 100) / 100;
                content = content + `Item has been purchased ${difference}% below MagicEden floor! \n\n`;
            }
        } else {
            const magicedenFee = magicedenFloor * 0.02;
            const royalties = metadata.royalties / 100 / 100 * magicedenFloor;
            const floorAfterFees = magicedenFloor - magicedenFee - royalties;

            if (price > floorAfterFees) {
                content = content + `Seller saved ${Math.floor((price - floorAfterFees) * 100) / 100} SOL in fees! (Compared to MagicEden) \n\n`
            }
        }

        content = content + `See transaction on SolScan: ${solscanUrl}`

        return content;
    })();

    const params = { status: content, media_ids: media }
    await client.post('statuses/update', params);
}

