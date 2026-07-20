import { supabaseServer } from "@/lib/supabase-server";
import DocumentReviewForm from "@/components/document-review-form";
import BackButton from "@/components/ui/back-button";

export default async function DocumentReviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const { data: document, error } = await supabaseServer
    .from("documents")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !document) {
    return (
      <main className="p-8">
        <h1 className="text-2xl font-bold">
          Document not found
        </h1>

        <p className="mt-4 text-red-500">
          {error?.message}
        </p>
      </main>
    );
  }

  const { data: signedUrlData } = await supabaseServer.storage
    .from("documents")
    .createSignedUrl(document.file_path, 300);

  return (
    <main className="mx-auto max-w-6xl space-y-8 p-8">
        <BackButton
        fallbackHref="/documents"
        label="Back to Documents"
        />
      <div>
        <h1 className="text-3xl font-bold">
          Review Document
        </h1>

        <p className="mt-2 text-muted-foreground">
          {document.file_name}
        </p>
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
            <p>Could not load document preview.</p>
          )}
        </section>

        <section className="rounded-lg border p-4">
          <h2 className="mb-4 font-semibold">
            AI Extracted Information
          </h2>

          <DocumentReviewForm
            documentId={document.id}
            extractedData={document.extracted_data}
          />
        </section>
      </div>
    </main>
  );
}