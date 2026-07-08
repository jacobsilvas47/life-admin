import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";
import { createActivity } from "@/lib/activity/create-activity";
import { createAsset } from "@/lib/assets/create-asset";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const asset = await createAsset(body);

    return NextResponse.json({
      success: true,
      asset,
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