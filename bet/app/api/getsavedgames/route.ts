export const runtime = "nodejs";

import dbClient from "../../../db";
import { NextResponse } from "next/server";
import redisClient from "../../../redis";
import { Db } from "mongodb";

interface SavedGamesDocument {
  userID: string;
  savedgames: any[] | null;
  savedbuttons: any[] | null;
  [key: string]: any;
}

export async function GET(request: Request): Promise<NextResponse> {
  try {
    const tok = request.headers.get("tok");

    if (!tok) {
      return NextResponse.json(
        { message: "Token missing" },
        { status: 400 }
      );
    }

    const usr_id = await redisClient.get(`auth_${tok}`);

    if (!usr_id) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    // ✅ Correct Atlas usage
    const db: Db = await dbClient.db();

    const gm: SavedGamesDocument | null = await db
      .collection<SavedGamesDocument>("savedgames")
      .findOne({ userID: usr_id });

    if (!gm) {
      return NextResponse.json(
        { savedgames: null, savedbuttons: null },
        { status: 200 }
      );
    }

    return NextResponse.json(
      {
        savedgames: gm.savedgames ?? null,
        savedbuttons: gm.savedbuttons ?? null,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Error processing request" },
      { status: 500 }
    );
  }
}
