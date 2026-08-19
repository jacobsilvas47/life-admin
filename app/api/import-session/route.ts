import { NextResponse } from "next/server";

import { supabaseServer } from "@/lib/supabase-server";
import { createAuthServerClient } from "@/lib/supabase-auth-server";
import { getEntitlements } from "@/lib/subscriptions/get-entitlements";

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
      !Number.isInteger(totalDocuments) ||
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

    /*
     * Check the user's plan before allowing
     * the import session to begin.
     */
    const entitlements =
      await getEntitlements();

    if (entitlements.documentLimit !== null) {
      const {
        count: documentCount,
        error: countError,
      } = await supabaseServer
        .from("documents")
        .select("id", {
          count: "exact",
          head: true,
        })
        .eq("user_id", user.id);

      if (countError) {
        throw countError;
      }

      const currentDocumentCount =
        documentCount ?? 0;

      const remainingDocuments = Math.max(
        entitlements.documentLimit -
          currentDocumentCount,
        0
      );

      if (
        currentDocumentCount + totalDocuments >
        entitlements.documentLimit
      ) {
        const isOverLimit =
          currentDocumentCount >
          entitlements.documentLimit;

        const documentsOverLimit = Math.max(
          currentDocumentCount -
            entitlements.documentLimit,
          0
        );

        return NextResponse.json(
          {
            success: false,
            code: isOverLimit
              ? "DOCUMENT_LIMIT_EXCEEDED"
              : "DOCUMENT_LIMIT_REACHED",

            error: isOverLimit
              ? `Your existing ${currentDocumentCount} documents are safe. Your Free plan includes up to ${entitlements.documentLimit} documents, so you'll need to remove ${documentsOverLimit} ${
                  documentsOverLimit === 1
                    ? "document"
                    : "documents"
                } or upgrade to Premium before uploading more.`
              : remainingDocuments === 0
                ? `You've reached the ${entitlements.documentLimit}-document limit on the Free plan. Your existing documents are safe. Upgrade to Premium for unlimited documents, or remove a document before uploading another.`
                : `You have ${remainingDocuments} document ${
                    remainingDocuments === 1
                      ? "slot"
                      : "slots"
                  } remaining on the Free plan. Select ${remainingDocuments} or fewer documents, or upgrade to Premium for unlimited documents.`,

            documentLimit:
              entitlements.documentLimit,

            documentCount:
              currentDocumentCount,

            remainingDocuments,

            documentsOverLimit,
          },
          {
            status: 403,
          }
        );
      }
    }

    /*
     * The requested batch fits within the
     * user's current plan.
     */
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