import Link from "next/link";
import { notFound } from "next/navigation";
import { supabaseServer } from "@/lib/supabase-server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import DocumentPreview from "@/components/documents/document-preview";
import DocumentViewer from "@/components/documents/document-viewer";
import BackButton from "@/components/ui/back-button";

export default async function PersonalRecordPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

    const { data: record, error } = await supabaseServer
    .from("personal_records")
    .select(`
        *,
        documents (*)
    `)
    .eq("id", id)
    .single();

  if (error || !record) {
    notFound();
  }

  let documentUrl: string | null = null;

    if (record.documents?.file_path) {
    const { data } = await supabaseServer.storage
        .from("documents")
        .createSignedUrl(
        record.documents.file_path,
        60 * 60
        );

    documentUrl = data?.signedUrl ?? null;
    }

  return (
    <main className="max-w-5xl mx-auto p-8 space-y-6">
      <BackButton
        fallbackHref="/personal-records"
        label="Back to Personal Records"
      />
        <div className="flex items-start justify-between gap-8">
          <div className="flex-1">
            <h1 className="text-3xl font-bold">
              {record.title}
            </h1>

            <p className="text-muted-foreground capitalize">
              {record.record_type.replaceAll("_", " ")}
            </p>
          </div>

          <Link
            href={`/personal-records/${record.id}/edit`}
            className="rounded-lg border px-4 py-2 text-sm font-medium transition hover:bg-gray-100 shrink-0"
          >
            ✏️ Edit
          </Link>
        </div>

      <Card>
        <CardHeader>
          <CardTitle>Record Information</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">

          <InfoRow
            label="Issuing Country"
            value={record.issuing_country}
          />

          <InfoRow
            label="Issue Date"
            value={record.issue_date}
          />

          <InfoRow
            label="Expiration Date"
            value={record.expiration_date}
          />

          <InfoRow
            label="Identifier"
            value={record.identifier}
          />

        </CardContent>
      </Card>

        <Card>
        <CardHeader>
            <CardTitle>Original Document</CardTitle>
        </CardHeader>

        <CardContent>
            {documentUrl && record.documents ? (
            <DocumentPreview
                fileName={record.documents.file_name}
                fileType={record.documents.file_type}
                signedUrl={documentUrl}
            />
            ) : (
            <p className="text-muted-foreground">
                No document attached.
            </p>
            )}
        </CardContent>
        </Card>
    </main>
  );
}

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: string | null;
}) {
  return (
    <div className="flex justify-between border-b pb-2">
      <span className="font-medium">
        {label}
      </span>

      <span className="text-muted-foreground">
        {value || "—"}
      </span>
    </div>
  );
}