export const runtime = "nodejs";

import { NextResponse } from "next/server";
import dbClient from "../../../db";
import redisClient from "../../../redis";
import { v4 as uuidv4 } from "uuid";

export async function POST(request: Request): Promise<NextResponse> {
  try {
    // --- Read headers ---
    const tobetHeader = request.headers.get("tobet");
    const tok = request.headers.get("tok");
    const betamtStr = request.headers.get("betamt");
    const potwin = request.headers.get("potwin");
    const oddsStr = request.headers.get("odds");

    if (!tok || !tobetHeader || !betamtStr || !oddsStr || !potwin) {
      return NextResponse.json({ message: "Incomplete data" }, { status: 400 });
    }

    const tobet = JSON.parse(tobetHeader);
    const betamt = parseFloat(betamtStr);
    const odds = parseFloat(oddsStr);

    // --- Validate user ---
    const usr_id = await redisClient.get(`auth_${tok}`);
    if (!usr_id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const db = await dbClient.db();
    const usr = await db.collection("users").findOne({ userID: usr_id });
    if (!usr) {
      return NextResponse.json({ message: "User not found" }, { status: 401 });
    }

    if (betamt <= 0 || odds <= 0) {
      return NextResponse.json(
        { message: "Invalid bet or odds" },
        { status: 400 },
      );
    }

    const accbal = parseFloat(usr.accbal);
    if (accbal < betamt) {
      return NextResponse.json(
        { message: "Insufficient balance" },
        { status: 401 },
      );
    }

    // --- Deduct balance ---
    await db
      .collection("users")
      .updateOne(
        { userID: usr_id },
        { $set: { accbal: (accbal - betamt).toFixed(2) } },
      );

    // --- Prepare bet document ---
    const now = new Date();
    const dt = now.toISOString().slice(0, 10).replace(/-/g, ""); // YYYYMMDD
    const tm = now.toTimeString().slice(0, 8).replace(/:/g, ""); // HHMMSS
    const gameID = uuidv4();

    const result = await db.collection("bets").insertOne({
      userID: usr_id,
      gameID,
      returns: "0.00",
      result: "Pending",
      date: dt,
      time: tm,
      betamt: betamt.toFixed(2),
      status: "open",
      potwin,
      odds: odds.toString(),
      bet: tobet,
    });

    if (!result.acknowledged) {
      return NextResponse.json(
        { message: "Failed to book game" },
        { status: 500 },
      );
    }

    // --- Return updated user info ---
    const updatedUser = await db
      .collection("users")
      .findOne({ userID: usr_id });
    if (!updatedUser) {
      return NextResponse.json(
        { message: "User not found after update" },
        { status: 500 },
      );
    }

    return NextResponse.json(
      {
        message: "Game Booked Successfully",
        me: {
          userID: updatedUser.userID,
          fname: updatedUser.fname,
          lname: updatedUser.lname,
          email: updatedUser.email,
          mobile: updatedUser.mobile,
          accbal: updatedUser.accbal,
          currency: updatedUser.currency,
        },
      },
      { status: 201 },
    );
  } catch (err) {
    console.error("Bet booking error:", err);
    return NextResponse.json(
      { message: "Error processing bet" },
      { status: 400 },
    );
  }
}
