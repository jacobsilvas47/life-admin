import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

export async function POST(req: Request) {
  try {
    const { totalDocuments } = await req.json();

    if (
      typeof totalDocuments !== "number" ||
      totalDocuments <= 0
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid totalDocuments.",
        },
        {
          status: 400,
        }
      );
    }

    const { data, error } =
      await supabaseServer
        .from("import_sessions")
        .insert({
          total_documents: totalDocuments,
        })
        .select()
        .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      session: data,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        error: "Could not create import session.",
      },
      {
        status: 500,
      }
    );
  }
}