import generateBanner from "./generators/generateBanner.js";
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import getNftMetadata, {LightNft} from "./getters/getNftMetadata.js";
import getMagicedenFloor from "./getters/getMagicedenFloor.js";
import {sendPostWithMedia} from "./utils/twitter.js";
import getSolanaUsdPrice from "./getters/getSolanaUsdPrice.js";
import {Readable} from "stream";
import setupTransactionsListener from "./listeners/setupTransactionsListener.js";
import {TradeActivity} from "./sdk/hadeswap-sdk-public/src/hadeswap-core/utils/index.js";
import {LAMPORTS_PER_SOL} from "@solana/web3.js";
import sendAlertToDiscord, { initBot } from "./utils/discord.js";
import express from 'express';
import {port} from "./constants/index.js";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

app.use('/static', express.static(path.join(__dirname, '/generators/output/')));

async function initApp() {
    await (async () => {
        const stream = new Readable({
            read(size: number) {
                return true;
            }
        });

        await initBot();
        await setupTransactionsListener(stream);

        stream.on('data', async (chunk) => {
            try {
                const parsedChunk: TradeActivity = JSON.parse((chunk as Buffer).toString());

                const price = Math.floor(parsedChunk.solAmount / LAMPORTS_PER_SOL * 100) / 100;
                if (!price) return;

                const solanaPrice = await getSolanaUsdPrice();
                const type = parsedChunk.orderType === 'sell' ? "Sale" : "Purchase";
                const usdPrice = Math.floor(solanaPrice * price * 100) / 100;

                let magicedenFloor: number;
                try {
                    magicedenFloor = await getMagicedenFloor(parsedChunk.nftMint);
                } catch (err) {
                    console.log(`Failed to fetch MagicEden floor for NFT: ${parsedChunk.nftMint}.`);
                    return;
                }

                let metadata: LightNft;
                try {
                    metadata = await getNftMetadata(parsedChunk.nftMint);
                } catch (err) {
                    console.log(`Failed to fetch metadata for NFT: ${parsedChunk.nftMint}.`);
                    return;
                }

                if (!metadata.name || !metadata.image) return;

                let banner: string;
                try {
                    banner = await generateBanner(
                        metadata,
                        price,
                        usdPrice,
                        magicedenFloor,
                        type,
                        parsedChunk.signature,
                        parsedChunk.nftMint
                    );
                } catch (err) {
                    banner = "";
                    console.log(`Failed to generate banner for TX: ${parsedChunk.signature}. Unable to send alerts to Discord & Twitter.`)
                    return;
                }

                try {
                    await sendAlertToDiscord(
                        metadata,
                        "",
                        metadata.name,
                        price,
                        usdPrice,
                        parsedChunk.signature,
                        type,
                        magicedenFloor,
                        parsedChunk.nftMint
                    );
                } catch (err) {
                    console.log("An error occured when sending alert to Discord.");
                }

                if (price > 10) {
                    try {
                        await sendPostWithMedia(
                            banner,
                            price,
                            usdPrice,
                            parsedChunk.signature,
                            parsedChunk.orderType === 'sell' ? "Sale" : "Purchase",
                            magicedenFloor,
                            metadata
                        );
                    } catch (err) {
                        console.log("An error occured when sending alert to Twitter.")
                    }
                }
            } catch (err) {
                console.log("Unknown error occurred.");
            }
        });
    })();
}

app.listen(port, async () => {
    console.log("APP IS RUNNING ON PORT " + port);
    await initApp();
});