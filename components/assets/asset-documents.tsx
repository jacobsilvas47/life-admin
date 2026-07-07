import Link from "next/link";
import { supabaseServer } from "@/lib/supabase-server";

export default async function AssetDocuments({
  assetId,
}: {
  assetId: string;
}) {
  const { data: documents, error } = await supabaseServer
    .from("asset_documents")
    .select(`
      document:documents (
        id,
        file_name,
        file_type
      )
    `)
    .eq("asset_id", assetId);

  if (error) {
    return (
      <section className="border rounded-xl p-6 bg-white shadow-sm">
        <h2 className="text-xl font-semibold mb-4">
          Documents
        </h2>

        <p className="text-red-500">
          Failed to load documents.
        </p>
      </section>
    );
  }

  return (
    <section className="border rounded-xl p-6 bg-white shadow-sm">
      <h2 className="text-xl font-semibold mb-4">
        Documents
      </h2>

      {documents.length === 0 ? (
        <p className="text-gray-500">
          No documents linked yet.
        </p>
      ) : (
        <div className="space-y-3">
          {documents.map((row: any) => (
            <Link
              key={row.document.id}
              href={`/documents/${row.document.id}`}
              className="flex justify-between border rounded-lg p-4 hover:bg-gray-50"
            >
              <div>
                <p className="font-medium">
                  📄 {row.document.file_name}
                </p>

                <p className="text-sm text-gray-500">
                  {row.document.file_type}
                </p>
              </div>

              <span className="text-gray-400">
                →
              </span>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}