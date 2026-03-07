export const runtime = "nodejs";

import { NextResponse } from "next/server";
import dbClient from "../../../db";
import redisClient from "../../../redis";

interface SavedGamesDocument {
  userID: string;
  savedgames: any[];
  savedbuttons: any[];
}

export async function POST(request: Request): Promise<NextResponse> {
  try {
    // --- Read headers ---
    const savedgamesHeader = request.headers.get("savedgames");
    const savedbuttonsHeader = request.headers.get("savedbuttons");
    const tok = request.headers.get("tok");

    if (!tok || !savedgamesHeader || !savedbuttonsHeader) {
      return NextResponse.json({ message: "Incomplete data" }, { status: 400 });
    }

    const savedgames = JSON.parse(savedgamesHeader);
    const savedbuttons = JSON.parse(savedbuttonsHeader);

    // --- Validate user ---
    const usr_id = await redisClient.get(`auth_${tok}`);
    if (!usr_id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const db = await dbClient.db();

    // --- Check if user already has saved games ---
    const usr_game: SavedGamesDocument | null = await db
      .collection<SavedGamesDocument>("savedgames")
      .findOne({ userID: usr_id });

    if (!usr_game) {
      // Insert new document
      const result = await db
        .collection<SavedGamesDocument>("savedgames")
        .insertOne({
          userID: usr_id,
          savedgames,
          savedbuttons,
        });

      if (!result.acknowledged) {
        return NextResponse.json(
          { message: "Error saving games" },
          { status: 500 },
        );
      }

      return NextResponse.json({ message: "Save Successful" }, { status: 201 });
    } else {
      // Update existing document
      const sa = await db
        .collection<SavedGamesDocument>("savedgames")
        .updateOne({ userID: usr_id }, { $set: { savedgames, savedbuttons } });

      if (!sa.acknowledged) {
        return NextResponse.json(
          { message: "Error updating saved games" },
          { status: 500 },
        );
      }

      return NextResponse.json({ message: "Save Successful" }, { status: 201 });
    }
  } catch (err) {
    console.error("Save games error:", err);
    return NextResponse.json(
      { message: "Error processing request" },
      { status: 400 },
    );
  }
}
