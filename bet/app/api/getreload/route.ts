export const runtime = "nodejs";

import { NextResponse } from "next/server";
import dbClient from "../../../db";
import redisClient from "../../../redis";
import { Db } from "mongodb";

interface User {
  userID: string;
  fname: string;
  lname: string;
  email: string;
  mobile: string;
  accbal: string;
  currency: string;
  rating: string;
  sub: string;
  TGames: string;
  TWon: string;
  TLost: string;
  nickname: string;
  [key: string]: any;
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

    // Fetch user
    let user: User | null = await db
      .collection<User>("users")
      .findOne({ userID: usr_id });
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 401 });
    }

    // Ensure minimum balance
    if (parseFloat(user.accbal) < 10000) {
      const sa = await db
        .collection<User>("users")
        .updateOne({ userID: usr_id }, { $set: { accbal: "10000" } });
      if (!sa.acknowledged) {
        return NextResponse.json(
          { message: "Failed to update balance" },
          { status: 400 },
        );
      }

      // Fetch the updated user
      user = await db.collection<User>("users").findOne({ userID: usr_id });
      if (!user) {
        return NextResponse.json(
          { message: "User not found after update" },
          { status: 401 },
        );
      }
    }

    return NextResponse.json(
      {
        me: {
          userID: user.userID,
          fname: user.fname,
          lname: user.lname,
          email: user.email,
          mobile: user.mobile,
          accbal: user.accbal,
          currency: user.currency,
          rating: user.rating,
          sub: user.sub,
          TGames: user.TGames,
          TWon: user.TWon,
          TLost: user.TLost,
          nickname: user.nickname,
        },
        logged: true,
        message: "Success",
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error in GET /user:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
