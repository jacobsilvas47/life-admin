import { NextResponse } from "next/server";

import { supabaseServer } from "@/lib/supabase-server";
import { createAuthServerClient } from "@/lib/supabase-auth-server";

export async function POST(req: Request) {
  try {
    const authSupabase =
      await createAuthServerClient();

    const {
      data: { user },
      error: authError,
    } = await authSupabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized.",
        },
        {
          status: 401,
        }
      );
    }

    const { totalDocuments } =
      await req.json();

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
          user_id: user.id,
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
  } catch (error: unknown) {
    console.error(
      "Create import session error:",
      error
    );

    const message =
      error instanceof Error
        ? error.message
        : "Could not create import session.";

    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      {
        status: 500,
      }
    );
  }
}