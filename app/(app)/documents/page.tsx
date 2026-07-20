import { supabaseServer } from "@/lib/supabase-server";
import DocumentsList from "@/components/documents/documents-list";

export default async function DocumentsPage() {
  const { data: documents, error } = await supabaseServer
    .from("documents")
    .select("*")
    .order("uploaded_at", { ascending: false });

  if (error) {
    return (
      <main className="p-8">
        <h1 className="text-2xl font-bold">
          Documents
        </h1>

        <p className="mt-4 text-red-500">
          {error.message}
        </p>
      </main>
    );
  }

  return (
    <main className="max-w-5xl mx-auto p-8">
      <h1 className="mb-8 text-3xl font-bold">
        Uploaded Documents
      </h1>

      <DocumentsList documents={documents ?? []} />
    </main>
  );
}