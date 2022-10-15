import {Readable} from "stream";
import {
    getTradeActivities,
    TradeActivity
} from "../sdk/hadeswap-sdk-public/src/hadeswap-core/utils/getTradeActivities.js";
import {mainnetProgramId, startingSignature, connection} from "../constants/index.js";
import {PublicKey} from '@solana/web3.js';

export default async function setupTransactionsListener(stream: Readable) {
    let lastSignature: string;
    const programId = new PublicKey(mainnetProgramId);

    setInterval(async () => {
        let activities: TradeActivity[];
        try {
            activities = await getTradeActivities({
                programId,
                connection,
                untilThisSignature: lastSignature || startingSignature
            });
        } catch (err) {
            console.log('Error occurred when fetching Hadeswap Trade Activities. It is probably caused by no new transactions occurring in the last 60 seconds.');
            activities = [];
        }

        activities.forEach(activity => {
            stream.push(Buffer.from(JSON.stringify(activity)));
        });

        if (activities.length) {
            lastSignature = activities[0].signature;
        }
    }, 60 * 1000);
}