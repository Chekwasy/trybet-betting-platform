export const runtime = "nodejs";

import dbClient from "../../../db";
import { NextResponse } from "next/server";
import redisClient from "../../../redis";
import { makeID, checkpwd } from "../../tools/func";
import crypto from "crypto";
import { Db, ObjectId } from "mongodb";

interface LoginRequestBody {
  auth_header: string;
}

interface User {
  _id?: ObjectId;
  email: string;
  password: string;
  userID: string;
}

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body: LoginRequestBody = await request.json();
    const { auth_header } = body;

    if (!auth_header) {
      return NextResponse.json(
        { message: "Unset auth header" },
        { status: 400 },
      );
    }

    const parts = auth_header.split(" ");
    if (parts.length !== 2 || parts[0] !== "Basic") {
      return NextResponse.json(
        { message: "Invalid auth format" },
        { status: 400 },
      );
    }

    const decoded = Buffer.from(parts[1], "base64").toString("utf-8");
    const [email, plainPwd] = decoded.split(":");

    if (!email || !plainPwd) {
      return NextResponse.json(
        { message: "Invalid credentials format" },
        { status: 400 },
      );
    }

    if (!checkpwd(plainPwd) || !checkpwd(email)) {
      return NextResponse.json(
        { message: "Invalid credentials format" },
        { status: 401 },
      );
    }

    const hashedPwd = crypto
      .createHash("sha256")
      .update(plainPwd)
      .digest("hex");

    const db: Db = await dbClient.db();
    const user = await db.collection<User>("users").findOne({ email });

    const tok = await redisClient.get(email);

    if (tok && parseInt(tok) > 5) {
      return NextResponse.json(
        { message: "Too many failed attempts" },
        { status: 429 },
      );
    }

    if (user && user.password === hashedPwd) {
      await redisClient.del(email);

      const authToken = makeID();

      await redisClient.set(`auth_${authToken}`, user.userID, {
        ex: 24 * 60 * 60,
      });

      return NextResponse.json({ token: authToken }, { status: 200 });
    }

    await redisClient.set(email, tok ? (parseInt(tok) + 1).toString() : "1", {
      ex: 24 * 60 * 60,
    });

    return NextResponse.json(
      { message: "Email or Password Incorrect" },
      { status: 400 },
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Error processing signin" },
      { status: 500 },
    );
  }
}
