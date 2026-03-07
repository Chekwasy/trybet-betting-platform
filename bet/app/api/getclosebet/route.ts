import dbClient from "../../../db";
import { NextResponse } from "next/server";
import redisClient from "../../../redis";
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

interface Bet {
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

export async function GET(request: Request): Promise<NextResponse> {
  try {
    const tok: string | null = request.headers.get("tok");

    if (!tok) {
      return NextResponse.json({ message: "Invalid token" }, { status: 400 });
    }

    const userId: string | null = await redisClient.get(`auth_${tok}`);

    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const db: Db = await dbClient.db();

    const games: Bet[] = await db
      .collection<Bet>("bets")
      .find({ userID: userId, status: "close" })
      .toArray();

    if (games.length === 0) {
      return NextResponse.json({ closebet: [] }, { status: 200 });
    }

    return NextResponse.json({ closebet: games }, { status: 200 });
  } catch (error: unknown) {
    console.error(error);
    return NextResponse.json(
      { message: "Error fetching closed bets" },
      { status: 500 },
    );
  }
}
