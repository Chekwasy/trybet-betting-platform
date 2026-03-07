export const runtime = "nodejs";

import dbClient from "../../../db";
import { NextResponse } from "next/server";
import redisClient from "../../../redis";
import { multiply } from "../../tools/multiply";
import axios from "axios";
import { Db } from "mongodb";

interface BetItem {
  id: string;
  gId: string;
  gTCountry: string;
  gSubtitle: string;
  mktT: string;
  mTime: string;
  hometeam: string;
  awayteam: string;
  odd: string;
  selection: string;
  mStatus: string;
  mResult: string;
  mOutcome: string;
  mScore: string;
}

interface BetDocument {
  userID: string;
  gameID: string;
  returns: string;
  result: string;
  date: string;
  time: string;
  betamt: string;
  status: string;
  potwin: string;
  odds: string;
  bet: BetItem[];
}

interface UserDocument {
  userID: string;
  fname: string;
  lname: string;
  email: string;
  mobile: string;
  accbal: string;
  currency: string;
}

export async function GET(request: Request): Promise<NextResponse> {
  try {
    const tok = request.headers.get("tok");

    if (!tok) {
      return NextResponse.json({ message: "Token missing" }, { status: 400 });
    }

    const usr_id = await redisClient.get(`auth_${tok}`);
    if (!usr_id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const db: Db = await dbClient.db();

    const usr = await db
      .collection<UserDocument>("users")
      .findOne({ userID: usr_id });

    if (!usr) {
      return NextResponse.json({ message: "User not found" }, { status: 401 });
    }

    let accbal = usr.accbal;

    const openBets = await db
      .collection<BetDocument>("bets")
      .find({ userID: usr_id, status: "open" })
      .toArray();

    if (openBets.length === 0) {
      return NextResponse.json({ openbet: [], me: null }, { status: 200 });
    }

    for (const betDoc of openBets) {
      let status = betDoc.status;
      let potwin = "1";
      let odds = "1";
      let result = betDoc.result;
      let returns = betDoc.returns;

      const updatedBetItems: BetItem[] = [];

      for (const item of betDoc.bet) {
        const itmCopy = { ...item };
        const date_ = item.mTime.substring(0, 8);

        const response = await axios.get(
          `https://prod-public-api.livescore.com/v1/api/app/date/soccer/${date_}/1?countryCode=NG&locale=en&MD=1`,
        );

        const gamesJson = response.data;

        for (const stage of gamesJson.Stages ?? []) {
          if (stage.Cnm === item.gTCountry && stage.Snm === item.gSubtitle) {
            for (const evt of stage.Events ?? []) {
              if (evt.T1?.[0]?.Nm === item.hometeam) {
                const homescore = String(evt.Tr1OR ?? "0");
                const awayscore = String(evt.Tr2OR ?? "0");

                if (["FT", "AET", "AP"].includes(evt.Eps)) {
                  itmCopy.mStatus = "FT";

                  if (+homescore > +awayscore) itmCopy.mResult = "Home Won";
                  else if (+homescore < +awayscore)
                    itmCopy.mResult = "Away Won";
                  else itmCopy.mResult = "Draw";

                  if (
                    (itmCopy.selection === "home" &&
                      itmCopy.mResult === "Home Won") ||
                    (itmCopy.selection === "away" &&
                      itmCopy.mResult === "Away Won") ||
                    (itmCopy.selection === "draw" && itmCopy.mResult === "Draw")
                  ) {
                    itmCopy.mOutcome = "Won";
                  } else {
                    itmCopy.mOutcome = "Lost";
                    itmCopy.odd = "1";
                  }

                  itmCopy.mScore = `${homescore} : ${awayscore}`;
                } else {
                  itmCopy.mOutcome = "Pending";
                }

                updatedBetItems.push(itmCopy);
                break;
              }
            }
            break;
          }
        }
      }

      let allWon = true;

      for (const item of updatedBetItems) {
        odds = multiply(odds, item.odd);

        if (item.mOutcome === "Lost") {
          result = "Lost";
          allWon = false;
        }

        if (item.mOutcome === "Pending") {
          allWon = false;
        }
      }

      potwin = multiply(betDoc.betamt, odds);

      if (allWon && result !== "Lost") {
        result = "Won";
        returns = potwin;
        accbal = (parseFloat(accbal) + parseFloat(potwin)).toFixed(2);

        await db
          .collection("users")
          .updateOne({ userID: usr_id }, { $set: { accbal } });
      }

      if (result === "Won" || result === "Lost") {
        status = "close";
      }

      await db.collection("bets").updateOne(
        { gameID: betDoc.gameID },
        {
          $set: {
            status,
            potwin,
            odds,
            returns,
            result,
            bet: updatedBetItems,
          },
        },
      );
    }

    const remainingOpen = await db
      .collection<BetDocument>("bets")
      .find({ userID: usr_id, status: "open" })
      .toArray();

    return NextResponse.json(
      {
        openbet: remainingOpen,
        me: {
          userID: usr.userID,
          fname: usr.fname,
          lname: usr.lname,
          email: usr.email,
          mobile: usr.mobile,
          accbal,
          currency: usr.currency,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Bet update error:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
