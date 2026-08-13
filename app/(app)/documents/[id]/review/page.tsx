import { notFound } from "next/navigation";

import { supabaseServer } from "@/lib/supabase-server";
import { createAuthServerClient } from "@/lib/supabase-auth-server";
import DocumentReviewForm from "@/components/document-review-form";
import BackButton from "@/components/ui/back-button";
import DeleteDocumentButton from "@/components/documents/delete-document-button";

export default async function DocumentReviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const authSupabase =
    await createAuthServerClient();

  const {
    data: { user },
  } = await authSupabase.auth.getUser();

  if (!user) {
    notFound();
  }

  const { data: document, error } =
    await supabaseServer
      .from("documents")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

  if (error || !document) {
    notFound();
  }

  const { data: signedUrlData } =
    await supabaseServer.storage
      .from("documents")
      .createSignedUrl(
        document.file_path,
        300
      );

  return (
    <main className="mx-auto max-w-7xl p-8">
      <BackButton
        fallbackHref="/documents"
        label="Back to Documents"
      />

      <div className="mb-8 mt-6 flex items-start justify-between gap-6">
        <div className="min-w-0">
          <h1 className="text-3xl font-bold">
            Review Document
          </h1>

          <p className="mt-2 truncate text-gray-500">
            {document.file_name}
          </p>
        </div>

        <DeleteDocumentButton
          documentId={document.id}
          fileName={document.file_name}
        />
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <section className="rounded-lg border p-4">
          <h2 className="mb-4 font-semibold">
            Original Document
          </h2>

          {signedUrlData?.signedUrl ? (
            <iframe
              src={signedUrlData.signedUrl}
              title={document.file_name}
              className="h-[700px] w-full rounded border"
            />
          ) : (
            <p>
              Could not load document preview.
            </p>
          )}
        </section>

        <section className="rounded-lg border p-4">
          <h2 className="mb-4 font-semibold">
            AI Extracted Information
          </h2>

          <DocumentReviewForm
            key={document.id}
            documentId={document.id}
            extractedData={
              document.extracted_data
            }
          />
        </section>
      </div>
    </main>
  );
}