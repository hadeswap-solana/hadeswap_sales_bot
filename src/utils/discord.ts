import {
    Client,
    GatewayIntentBits,
    ButtonStyle,
    TextInputStyle,
    InteractionType,
    TextChannel,
    Guild,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    GuildBasedChannel,
} from 'discord.js';
import {channelId, domain, guildId, token} from '../constants/index';
import {LightNft} from "../getters/getNftMetadata.js";

const bot = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ]
});

export async function initBot(): Promise<void> {
    try {
        await bot.login(token);
    } catch (err) {
        console.log("Something went wrong while initialising the bot.");
    }
}

export default async function sendAlertToDiscord(
    metadata: LightNft,
    thumbnail: string,
    name: string,
    price: number,
    usd_price: number,
    signature: string,
    type: "Sale" | "Purchase",
    magicedenFloor: number,
    address: string,
) : Promise<void> {

    let guild: Guild, channel: GuildBasedChannel | null;
    try {
        guild = await bot.guilds.fetch(guildId);
        channel = await guild.channels.fetch(channelId);
    } catch (err) {
        console.log("Something went wrong when fetching Guild // Channel.");
        channel = null;
    }

    if (!channel || !(channel instanceof TextChannel)) return;

    const embed = new EmbedBuilder()
        .setColor(0x83caff)
        .setImage(`${domain}/static/${signature}_${address}.jpeg`)
        .setTimestamp()
        .setFooter({
            text: "Hadeswap Sales Bot",
            iconURL: 'https://i.ibb.co/nmVPTWf/114495678.jpg'
        })
        .setTitle(`${name} has been ${type === "Sale" ? "sold" : "purchased"} on Hadeswap for ${price} SOL ($${usd_price})!`);

    if (type === "Purchase") {
        if (price < magicedenFloor) {
            const difference = Math.floor((100 - (Math.floor(price / magicedenFloor * 100 * 100) / 100)) * 100) / 100;
            embed.addFields([
                { value: "(Compared to MagicEden)", name: `Item has been purchased ${difference}% below collection's floor!` }
            ]);
        }
    } else {
        const magicedenFee = magicedenFloor * 0.02;
        const floorAfterFees = magicedenFloor - magicedenFee;

        if (price > floorAfterFees) {
            embed.addFields([
                {value: "(Compared to MagicEden)", name: `Seller saved ${Math.floor((price - floorAfterFees) * 100) / 100} SOL in fees!`}
            ])
        }
    }

    const buttonRow = new ActionRowBuilder<ButtonBuilder>()
        .addComponents([
            new ButtonBuilder()
                .setStyle(ButtonStyle.Link)
                .setURL(`https://solscan.io/tx/${signature}`)
                .setLabel('See on SolScan'),
            new ButtonBuilder()
                .setStyle(ButtonStyle.Link)
                .setURL(`https://hadeswap.com`)
                .setLabel('Visit Hadeswap'),
        ])

    try {
        await channel.send({ embeds: [embed], components: [buttonRow] });
    } catch (err) {
        console.log("Something went wrong when forwarding transaction alert to Discord.", err);
    }
}