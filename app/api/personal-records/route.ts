import { NextResponse } from "next/server";
import { createPersonalRecord } from "@/lib/personal-records/create-personal-record";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const personalRecord = await createPersonalRecord(body);

    return NextResponse.json({
      success: true,
      personalRecord,
    });
  } catch (error: any) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      {
        status: 500,
      }
    );
  }
}