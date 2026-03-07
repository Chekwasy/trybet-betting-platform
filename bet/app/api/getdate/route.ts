export const runtime = "nodejs";

import { NextResponse } from "next/server";

interface TimeResponse {
  hour: number;
  minute: number;
  day: number;
  month: number;
  year: number;
}

export async function GET(): Promise<NextResponse> {
  try {
    const today = new Date();

    const response: TimeResponse = {
      hour: today.getHours(),
      minute: today.getMinutes(),
      day: today.getDate(),
      month: today.getMonth() + 1,
      year: today.getFullYear(),
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Error processing request" },
      { status: 500 },
    );
  }
}
