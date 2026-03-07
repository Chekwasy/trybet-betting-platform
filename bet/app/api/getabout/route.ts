export const runtime = "nodejs";

import dbClient from "../../../db";
import { NextResponse } from "next/server";
import { Db, ObjectId } from "mongodb";

interface AboutDocument {
  _id?: ObjectId;
  data: string;
  about: string;
}

export async function GET(): Promise<NextResponse> {
  try {
    const db: Db = await dbClient.db();

    const aboutDoc = await db
      .collection<AboutDocument>("about")
      .findOne({ data: "myabout" });

    if (!aboutDoc) {
      return NextResponse.json(
        { message: "About content not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(
      {
        about: aboutDoc.about,
        message: "Success",
      },
      { status: 200 },
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Error fetching about content" },
      { status: 500 },
    );
  }
}
