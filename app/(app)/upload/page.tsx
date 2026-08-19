import Link from "next/link";

import UploadDropzone from "@/components/upload-dropzone";
import { Button } from "@/components/ui/button";
import { createAuthServerClient } from "@/lib/supabase-auth-server";
import { supabaseServer } from "@/lib/supabase-server";
import { getEntitlements } from "@/lib/subscriptions/get-entitlements";

export default async function UploadPage() {
  const authSupabase =
    await createAuthServerClient();

  const {
    data: { user },
  } = await authSupabase.auth.getUser();

  const entitlements =
    await getEntitlements();

  let documentCount = 0;

  if (user) {
    const { count } = await supabaseServer
      .from("documents")
      .select("id", {
        count: "exact",
        head: true,
      })
      .eq("user_id", user.id);

    documentCount = count ?? 0;
  }

  const isOverDocumentLimit =
    entitlements.documentLimit !== null &&
    documentCount > entitlements.documentLimit;

  const documentsOverLimit =
    entitlements.documentLimit !== null
      ? Math.max(
          documentCount -
            entitlements.documentLimit,
          0
        )
      : 0;
  return (
    <div className="mx-auto max-w-3xl">
      <div>
        <h1 className="text-5xl font-bold">
          Scan & Upload
        </h1>

        <p className="mt-4 text-muted-foreground">
          Upload receipts, warranties, manuals, IDs, and other important documents.
        </p>
      </div>

      {isOverDocumentLimit && (
        <div className="mt-8 rounded-xl border border-amber-200 bg-amber-50 p-5">
          <h2 className="font-semibold text-amber-950">
            You&apos;re over your Free plan limit
          </h2>

          <p className="mt-2 text-sm text-amber-900">
            You currently have {documentCount} documents.
            Your Free plan includes up to{" "}
            {entitlements.documentLimit}. Your existing
            documents are safe, but you&apos;ll need to
            remove {documentsOverLimit}{" "}
            {documentsOverLimit === 1
              ? "document"
              : "documents"}{" "}
            or upgrade to Premium before uploading more.
          </p>

          <div className="mt-4">
            <Button asChild>
              <Link href="/upgrade">
                Upgrade to Premium
              </Link>
            </Button>
          </div>
        </div>
      )}

      <div className="mt-10">
        <UploadDropzone />
      </div>
    </div>
  );
}