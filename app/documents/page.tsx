import { supabaseServer } from "@/lib/supabase-server";
import ProcessDocumentButton from "@/components/process-document-button";
import Link from "next/link";

export default async function DocumentsPage() {
  const { data: documents, error } = await supabaseServer
    .from("documents")
    .select("*")
    .order("uploaded_at", { ascending: false });

  if (error) {
    return (
      <main className="p-8">
        <h1 className="text-2xl font-bold">Documents</h1>
        <p className="text-red-500 mt-4">{error.message}</p>
      </main>
    );
  }

  return (
    <main className="max-w-5xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">
        Uploaded Documents
      </h1>

      <div className="space-y-4">
        {documents?.map((doc) => (
          <div
            key={doc.id}
            className="border rounded-lg p-4 flex items-center justify-between"
          >
            <div>
            <p className="font-semibold">{doc.file_name}</p>
            <p className="text-sm text-gray-500">
                Status: {doc.status}
            </p>
            </div>

            <div className="flex items-center gap-3">
            <Link
                href={`/documents/${doc.id}`}
                className="text-sm underline hover:text-blue-600"
            >
                Review
            </Link>

            <ProcessDocumentButton documentId={doc.id} />
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}