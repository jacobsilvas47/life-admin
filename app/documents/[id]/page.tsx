import { supabaseServer } from "@/lib/supabase-server";
import DocumentReviewForm from "@/components/document-review-form";

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
        <h1 className="text-2xl font-bold">Document not found</h1>
        <p className="text-red-500 mt-4">{error?.message}</p>
      </main>
    );
  }

  const { data: signedUrlData } = await supabaseServer.storage
    .from("documents")
    .createSignedUrl(document.file_path, 300);

  return (
    <main className="max-w-6xl mx-auto p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Review Document</h1>
        <p className="text-gray-500 mt-2">{document.file_name}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <section className="border rounded-lg p-4">
          <h2 className="font-semibold mb-4">Original Document</h2>

          {signedUrlData?.signedUrl ? (
            <iframe
              src={signedUrlData.signedUrl}
              className="w-full h-[700px] border rounded"
            />
          ) : (
            <p>Could not load document preview.</p>
          )}
        </section>

        <section className="border rounded-lg p-4">
          <h2 className="font-semibold mb-4">AI Extracted Information</h2>

          <DocumentReviewForm
            documentId={document.id}
            extractedData={document.extracted_data}
          />
        </section>
      </div>
    </main>
  );
}