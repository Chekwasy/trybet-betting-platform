export const runtime = "nodejs";

import dbClient from "../../../db";
import { NextResponse } from "next/server";
import crypto from "crypto";
import { makeID, checkpwd } from "../../tools/func";
import { getDateTimeString, getThirtiethDay } from "../../tools/dateitems";
import { Db } from "mongodb";

interface SignupBody {
  emailpwd: string;
  firstname: string;
  lastname: string;
}

interface User {
  userID: string;
  email: string;
  password: string;
  fname: string;
  lname: string;
  mobile: string;
  accbal: string;
  currency: string;
  rating: string;
  sub: string;
  TGames: string;
  TWon: string;
  TLost: string;
  nickname: string;
  jdate: string;
}

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const dd: SignupBody = await request.json();
    const { emailpwd, firstname, lastname } = dd;

    if (!emailpwd || !firstname || !lastname) {
      return NextResponse.json(
        { message: "Incomplete signup data" },
        { status: 400 },
      );
    }

    // Decode base64 email:password
    const encoded_usr_str = emailpwd.split(" ")[1];
    if (!encoded_usr_str) {
      return NextResponse.json(
        { message: "Invalid encoded credentials" },
        { status: 400 },
      );
    }

    const decoded_usr_str = Buffer.from(encoded_usr_str, "base64").toString(
      "utf-8",
    );

    const usr_details = decoded_usr_str.split(":");
    const email = usr_details[0];
    const rawPassword = usr_details[1];

    if (!email || !rawPassword) {
      return NextResponse.json(
        { message: "Invalid email or password format" },
        { status: 400 },
      );
    }

    // Hash password
    const password = crypto
      .createHash("sha256")
      .update(rawPassword)
      .digest("hex");

    const userID = makeID();

    // Validation checks
    if (!checkpwd(email))
      return NextResponse.json(
        { message: "Invalid email characters" },
        { status: 400 },
      );

    if (!checkpwd(firstname))
      return NextResponse.json(
        { message: "Invalid firstname characters" },
        { status: 400 },
      );

    if (!checkpwd(lastname))
      return NextResponse.json(
        { message: "Invalid lastname characters" },
        { status: 400 },
      );

    if (!checkpwd(rawPassword))
      return NextResponse.json(
        { message: "Invalid password characters" },
        { status: 400 },
      );

    // --- Typed MongoDB instance ---
    const db: Db = await dbClient.db();

    const existingUser: User | null = await db
      .collection<User>("users")
      .findOne({ email });

    if (existingUser) {
      return NextResponse.json(
        { message: "User already exists" },
        { status: 409 },
      );
    }

    const jdate = getDateTimeString();
    const curDay = new Date().getDate();
    const sevth = `mont_${getThirtiethDay(curDay.toString())}`;

    const newUser: User = {
      userID,
      email,
      password,
      fname: firstname,
      lname: lastname,
      mobile: "",
      accbal: "10000",
      currency: "N",
      rating: "",
      sub: `free_${sevth}`,
      TGames: "",
      TWon: "",
      TLost: "",
      nickname: "",
      jdate,
    };

    const result = await db.collection<User>("users").insertOne(newUser);

    if (!result.acknowledged) {
      return NextResponse.json({ message: "Signup failed" }, { status: 500 });
    }

    return NextResponse.json(
      { success: email, message: "Signup Successful" },
      { status: 201 },
    );
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { message: "Error processing signup" },
      { status: 500 },
    );
  }
}
