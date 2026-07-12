import { notFound } from "next/navigation";
import { supabaseServer } from "@/lib/supabase-server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
      <div>
        <h1 className="text-3xl font-bold">
          {record.title}
        </h1>

        <p className="text-muted-foreground capitalize">
          {record.record_type.replaceAll("_", " ")}
        </p>
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

            {documentUrl ? (

            <div className="space-y-4">

                <p className="font-medium">
                {record.documents.file_name}
                </p>

                <a
                href={documentUrl}
                target="_blank"
                className="text-blue-600 underline"
                >
                Open Document
                </a>

            </div>

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