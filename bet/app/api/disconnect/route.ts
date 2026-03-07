export const runtime = "nodejs";

import { NextResponse } from "next/server";
import redisClient from "../../../redis";

export async function GET(request: Request): Promise<NextResponse> {
  try {
    const tok: string | null = request.headers.get("tok");

    if (!tok) {
      return NextResponse.json({ message: "Invalid token" }, { status: 400 });
    }

    const userId: string | null = await redisClient.get(`auth_${tok}`);

    if (!userId) {
      return NextResponse.json(
        { message: "User not found or already logged out" },
        { status: 401 },
      );
    }

    await redisClient.del(`auth_${tok}`);

    return NextResponse.json(
      { message: "Logged Out Successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Error processing logout" },
      { status: 500 },
    );
  }
}
