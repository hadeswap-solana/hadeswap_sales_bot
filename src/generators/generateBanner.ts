import {LightNft} from "../getters/getNftMetadata";
import {createCanvas, loadImage, registerFont} from "canvas";

import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from "fs";
import getSolanaUsdPrice from "../getters/getSolanaUsdPrice.js";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default async function generateBanner(
    metadata: LightNft,
    price: number,
    usdPrice: number,
    magicedenFloor: number,
    type: "Sale" | "Purchase",
    signature: string,
    address: string,
) : Promise<string> {
    return new Promise(async (resolve, reject) => {
        try {
            // FONTS
            registerFont(__dirname + '/fonts/Poppins.ttf', { family: "Poppins", style: "regular" });
            registerFont(__dirname + '/fonts/PoppinsBold.ttf', { family: "PoppinsBold", style: "regular" });

            // PARAMETERS FOR NFT IMAGE
            const radius = 20;
            const x = 100;
            const width = 500;
            const height = 500;
            const y = 150;


            // INITIALIZE CANVAS
            const canvas = createCanvas(1200, 800);
            const ctx = canvas.getContext('2d');

            // LOAD ALL NECESSARY IMAGES
            const logo = await loadImage(__dirname + '/input/hadeswap_logo.png');
            const solana = await loadImage(__dirname + '/input/solana.png');
            const image = await loadImage(`https://img-cdn.magiceden.dev/rs:fill:400:400:0:0/plain/${metadata.image}`);

            // FILL CANVAS WITH GRADIENT
            const gradient = ctx.createLinearGradient(0, 0, 1200, 800);
            gradient.addColorStop(0, "#23395d");
            gradient.addColorStop(0.5, '#203354');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, 1200, 800);

            // ADDING 'NEW HADESWAP TRADE' TEXT
            ctx.font = '26px Poppins';
            ctx.fillStyle = '#bdecfe';
            ctx.fillText('NEW HADESWAP TRADE!', 650, 280);

            // PUTTING NFT NAME ON THE BANNER
            ctx.font = `${ metadata.name.length < 17 ? "44px" : "32px" } PoppinsBold`;
            ctx.fillStyle = '#83caff';
            ctx.fillText(metadata.name, 650, 330);

            // ADDING 'SOLD/PURCHASED FOR' TEXT
            ctx.font = `26px PoppinsBold`;
            ctx.fillStyle = '#ffffff';
            ctx.fillText(`${type === 'Sale' ? "SOLD" : "PURCHASED"} FOR:`, 650, 440);

            // PUTTING NFT PRICE ON THE BANNER
            ctx.font = `60px PoppinsBold`;
            ctx.fillStyle = '#ffffff';
            ctx.fillText(`${price}`, 650 + (449 / 8) + 12.5, 447.5 + 60);

            // ADDING SOLANA LOGO NEXT TO THE NFT PRICE
            ctx.drawImage(solana, 650, 462.5, 449 / 8, 358 / 8);

            // ADDING HADESWAP LOGO IN THE BOTTOM-RIGHT OF THE BANNER
            ctx.drawImage(logo, 830, 680, 300, 60);

            // CALCULATING DIFFERENCE BETWEEN PRICE AND MAGICEDEN FLOOR & PUTTING ON BANNER
            ctx.font = '20px Poppins';
            ctx.fillStyle = '#83caff';

            if (type === "Purchase") {
                if (price < magicedenFloor) {
                    const difference = Math.floor((100 - (Math.floor(price / magicedenFloor * 100 * 100) / 100)) * 100) / 100;
                    ctx.fillText(`${difference}% below MagicEden floor!`, 650, 545);
                } else {
                    ctx.fillText(`$${usdPrice} USD`, 650, 545);
                }
            } else {
                const magicedenFee = magicedenFloor * 0.02;
                const royalties = metadata.royalties / 100 / 100 * magicedenFloor;
                const floorAfterFees = magicedenFloor - magicedenFee - royalties;

                if (price > floorAfterFees) {
                    const difference = Math.floor((price - floorAfterFees) * 100) / 100;
                    if (difference > 0) {
                        ctx.fillText(`Seller saved ${Math.floor((price - floorAfterFees) * 100) / 100} SOL in fees \n(compared to MagicEden)`, 650, 545);
                    }
                } else {
                    ctx.fillText(`$${usdPrice} USD`, 650, 545);
                }
            }

            // PUTTING NFT IMAGE ON THE BANNER, ADDING STROKE AND BORDER RADIUS
            ctx.beginPath();
            ctx.moveTo(x + radius, y);
            ctx.lineTo(x + width - radius, y);
            ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
            ctx.lineTo(x + width, y + height - radius);
            ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
            ctx.lineTo(x + radius, y + height);
            ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
            ctx.lineTo(x, y + radius);
            ctx.quadraticCurveTo(x, y, x + radius, y);
            ctx.closePath();
            ctx.clip();
            ctx.drawImage(image, x, y, width, height);
            ctx.rect(x, y, width, height);
            ctx.strokeStyle = '#bdecfe';
            ctx.lineWidth = 10;
            ctx.stroke();
            ctx.closePath();

            const path = __dirname + `/output/${signature}_${address}.jpeg`;
            const out = fs.createWriteStream(path);
            const stream = canvas.createJPEGStream();
            stream.pipe(out);

            out.on('finish', () =>  {
                console.log(`The JPEG banner for transaction ${signature} was created.`);
                resolve(path)
            });
        } catch (err) {
            reject(err);
        }
    });
}