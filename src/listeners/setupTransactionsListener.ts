import { Readable } from "stream";
import {
  getTradeActivities,
  TradeActivity,
} from "hadeswap-sdk/lib/hadeswap-core/utils/index.js";
import {
  mainnetProgramId,
  connection,
} from "../constants/index.js";
import { PublicKey } from "@solana/web3.js";

export default async function setupTransactionsListener(stream: Readable) {
  const programId = new PublicKey(mainnetProgramId);

  let lastSignature: string = (await connection.getConfirmedSignaturesForAddress2(
      programId,
      {
        limit: 1
      }
  ))[0].signature;

  setInterval(async () => {
    let activities: TradeActivity[];
    try {
      activities = await getTradeActivities({
        programId,
        connection,
        untilThisSignature: lastSignature,
      });
    } catch (err) {
      console.log(
        "Error occurred when fetching Hadeswap Trade Activities. It is probably caused by no new transactions occurring in the last 60 seconds."
      );
      activities = [];
    }

    activities.forEach((activity) => {
      stream.push(Buffer.from(JSON.stringify(activity)));
    });

    if (activities.length) {
      lastSignature = activities[0].signature;
    }
  }, 60 * 1000);
}
