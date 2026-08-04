import { supabaseServer } from "@/lib/supabase-server";
import DocumentPreview from "@/components/documents/document-preview";

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
        file_type,
        file_path
      )
    `)
    .eq("asset_id", assetId);

  if (error) {
    return (
      <section className="rounded-xl border bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-xl font-semibold">
          Related Documents
        </h2>

        <p className="text-red-500">
          Failed to load documents.
        </p>
      </section>
    );
  }

  if (!documents || documents.length === 0) {
    return (
      <section className="rounded-xl border bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-xl font-semibold">
          Related Documents
        </h2>

        <p className="text-muted-foreground">
          No documents linked yet.
        </p>
      </section>
    );
  }

  const documentsWithUrls = await Promise.all(
    documents.map(async (row) => {
      const document = Array.isArray(row.document)
        ? row.document[0]
        : row.document;

      if (!document) {
        return null;
      }

      const { data } = await supabaseServer.storage
        .from("documents")
        .createSignedUrl(
          document.file_path,
          60 * 60
        );

      return {
        ...document,
        signedUrl: data?.signedUrl ?? null,
      };
    })
  );

  const validDocuments = documentsWithUrls.filter(
    (document): document is NonNullable<typeof document> =>
      document !== null
  );

  return (
    <section className="rounded-xl border bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-xl font-semibold">
        Related Documents
      </h2>

      <div className="space-y-6">
        {validDocuments.map((document) => (
          <div
            key={document.id}
            className="rounded-lg border p-4"
          >
            <h3 className="mb-4 font-medium">
              {document.file_name}
            </h3>

            {document.signedUrl ? (
              <DocumentPreview
                fileName={document.file_name}
                fileType={document.file_type}
                signedUrl={document.signedUrl}
              />
            ) : (
              <p className="text-muted-foreground">
                Could not load preview.
              </p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}