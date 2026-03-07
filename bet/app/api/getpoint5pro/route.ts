export const runtime = "nodejs";

import { NextResponse } from "next/server";
import dbClient from "../../../db";
import redisClient from "../../../redis";
import { isDateInPast } from "../../tools/dateitems";
import { Db } from "mongodb";

interface User {
  userID: string;
  sub: string;
  [key: string]: any;
}

interface Point5ProGame {
  date: string;
  game: any[];
}

export async function GET(request: Request): Promise<NextResponse> {
  try {
    const url = new URL(request.url);
    const date = url.searchParams.get("date");

    const tok = request.headers.get("tok");
    if (!tok) {
      return NextResponse.json({ message: "Token missing" }, { status: 400 });
    }

    const usr_id = await redisClient.get(`auth_${tok}`);
    if (!usr_id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const db: Db = await dbClient.db();

    const usr: User | null = await db
      .collection<User>("users")
      .findOne({ userID: usr_id });

    if (!usr) {
      return NextResponse.json({ message: "User not found" }, { status: 401 });
    }

    // Check subscription expiry
    if (isDateInPast(usr.sub.slice(-8))) {
      return NextResponse.json(
        { game: null, message: "Success" },
        { status: 200 },
      );
    }

    if (!date) {
      return NextResponse.json({ message: "Date missing" }, { status: 400 });
    }

    const gameDoc: Point5ProGame | null = await db
      .collection<Point5ProGame>("point5pro")
      .findOne({ date });

    if (!gameDoc) {
      return NextResponse.json(
        { game: null, message: "Success" },
        { status: 200 },
      );
    }

    return NextResponse.json(
      { game: gameDoc.game, message: "Success" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error fetching point5pro game:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
