import {Metaplex} from "@metaplex-foundation/js";
import {Connection} from "@solana/web3.js";

// APP DATA
const port: number = parseInt(process.env.PORT || "8080");
const domain: string = process.env.DOMAIN || "";

// SOLANA RPCS
const mainnetUrl: string = process.env.MAINNET_URL || "https://intensive-long-dew.solana-mainnet.discover.quiknode.pro/c2a770f2fdcb12f3ef435e424e9038fade3d8d74/";
const devnetUrl: string = process.env.DEVNET_URL || "";

// HADESWAP CONSTANTS
const mainnetProgramId: string = 'hadeK9DLv9eA7ya5KCTqSvSvRZeJC3JgD5a9Y3CNbvu';
const devnetProgramId: string = process.env.DEVNET_PROGRAM_ID || "";
const startingSignature: string = process.env.STARTING_SIGNATURE || "";

// DISCORD DATA
const guildId: string = process.env.GUILD_ID || "";
const channelId: string = process.env.CHANNEL_ID || "";
const token: string = process.env.TOKEN || "";

// TWITTER DATA - TO BE UPDATED;
const keyMin: string = process.env.KEY_MIN || "";
const secretMin: string = process.env.SECRET_MIN || "";
const bearerMin: string = process.env.BEARER_MIN || "";
const accessTokenMin: string = process.env.ACCESS_TOKEN_MIN || "";
const accessSecretMin: string = process.env.ACCESS_SECRET_MIN || "";


// SOLANA & METAPLEX
const connection = new Connection(mainnetUrl, 'confirmed');
const metaplex = new Metaplex(connection, { cluster: 'mainnet-beta' });

export {
    mainnetUrl,
    accessSecretMin,
    accessTokenMin,
    devnetUrl,
    devnetProgramId,
    mainnetProgramId,
    guildId,
    startingSignature,
    channelId,
    secretMin,
    keyMin,
    bearerMin,
    metaplex,
    connection,
    token,
    domain,
    port
}
