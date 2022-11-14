import generateBanner from "./generators/generateBanner.js";
import { fileURLToPath } from "url";
import { dirname } from "path";
import getNftMetadata, { LightNft } from "./getters/getNftMetadata.js";
import getMagicedenFloor from "./getters/getMagicedenFloor.js";
import { sendPostWithMedia } from "./utils/twitter.js";
import { sendPostWithMedia as sendPostWithMediaPremium } from "./utils/twitterPremium.js";
import getSolanaUsdPrice from "./getters/getSolanaUsdPrice.js";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import sendAlertToDiscord, { initBot } from "./utils/discord.js";
import express from "express";
import consoleStamp from "console-stamp";
import bodyParser from "body-parser";
import { port } from "./constants/index.js";
import path from "path";
import fs from "fs";

consoleStamp(console);

const SERVER_ERROR = 500;
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

app.use(bodyParser.json())
app.use("/static", express.static(path.join(__dirname, "/generators/output/")));

app.post("/send", async (req, res) => {
  const { solAmount, orderType, nftMint, signature } = req.body;

  const price = Math.floor((solAmount / LAMPORTS_PER_SOL) * 100) / 100;
  if (!price) {
    console.log(`Bad price: ${price}.`);
    return res.end();
  }

  const solanaPrice = await getSolanaUsdPrice();
  const type = orderType === "sell" ? "Sale" : "Purchase";
  const usdPrice = Math.floor(solanaPrice * price * 100) / 100;

  let magicedenFloor: number;
  try {
    magicedenFloor = await getMagicedenFloor(nftMint);
  } catch (err) {
    console.log(`Failed to fetch MagicEden floor for NFT: ${nftMint}.`);
    return res.status(SERVER_ERROR).end();
  }

  let metadata: LightNft;
  try {
    metadata = await getNftMetadata(nftMint);

    if (!metadata.name || !metadata.image) {
      throw new Error();
    }
  } catch (err) {
    console.log(`Failed to fetch metadata for NFT: ${nftMint}.`);
    return res.status(SERVER_ERROR).end();
  }

  let banner: string;
  try {
    banner = await generateBanner(
        metadata,
        price,
        usdPrice,
        magicedenFloor,
        type,
        signature,
        nftMint
    );
  } catch (err) {
    banner = "";
    console.log(`Failed to generate banner for TX: ${signature}. Unable to send alerts to Discord & Twitter.`);
    return res.status(SERVER_ERROR).end();
  }

  try {
    await sendAlertToDiscord(
        banner,
        metadata,
        "",
        metadata.name,
        price,
        usdPrice,
        signature,
        type,
        magicedenFloor,
        nftMint
    );
  } catch (err) {
    console.log("An error occured when sending alert to Discord.", err);
  }

  if (price < 10) {
    try {
      await sendPostWithMedia(
          banner,
          price,
          usdPrice,
          signature,
          orderType === "sell" ? "Sale" : "Purchase",
          magicedenFloor,
          metadata
      );
    } catch (err) {
      console.log("An error occured when sending alert to Twitter.", JSON.stringify(err.twitterReply));
    }
  } else {

    try {
      await sendPostWithMediaPremium(
          banner,
          price,
          usdPrice,
          signature,
          orderType === "sell" ? "Sale" : "Purchase",
          magicedenFloor,
          metadata
      );
    } catch (err) {
      console.log("An error occured when sending alert to Twitter.", JSON.stringify(err.twitterReply));
    }
  }

  if (banner) {
    fs.unlinkSync(banner);
  }

  res.end();
});

app.listen(port, async () => {
  console.log("APP IS RUNNING ON PORT " + port);
  await initBot();
});
