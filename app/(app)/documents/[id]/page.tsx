import Link from "next/link";
import { notFound } from "next/navigation";
import { supabaseServer } from "@/lib/supabase-server";
import DocumentPreview from "@/components/documents/document-preview";
import SectionCard from "@/components/ui/section-card";
import BackButton from "@/components/ui/back-button";
import { Button } from "@/components/ui/button";

export default async function DocumentDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

const { data: document, error } = await supabaseServer
  .from("documents")
  .select(`
    *,
    extracted_data
  `)
  .eq("id", id)
  .single();

  if (error || !document) {
    notFound();
  }

  const { data: signedUrlData } = await supabaseServer.storage
    .from("documents")
    .createSignedUrl(document.file_path, 60 * 60);

  const documentUrl = signedUrlData?.signedUrl ?? null;

  return (
    <main className="mx-auto max-w-6xl space-y-6 p-8">
      <BackButton
        fallbackHref="/documents"
        label="Back to Documents"
      />
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            {document.file_name}
          </h1>

          <p className="mt-1 text-muted-foreground">
            Document details and preview
          </p>
        </div>

        <Button asChild variant="outline">
          <Link href={`/documents/${document.id}/review`}>
            Review
          </Link>
        </Button>
      </div>

      <SectionCard
        title="Document Information"
        description="Details about the uploaded file."
      >
        <InfoRow
          label="File name"
          value={document.file_name}
        />

        <InfoRow
          label="File type"
          value={document.file_type}
        />

        <div className="flex items-center justify-between border-b py-3">
          <span className="text-sm font-medium text-muted-foreground">
            Status
          </span>

          <span
            className={`rounded-full px-3 py-1 text-sm font-medium ${getStatusClasses(
              document.status
            )}`}
          >
            {formatLabel(document.status)}
          </span>
        </div>

        <InfoRow
          label="Uploaded"
          value={
            document.uploaded_at
              ? new Date(document.uploaded_at).toLocaleDateString()
              : null
          }
        />
      </SectionCard>

      <SectionCard
        title="AI Analysis"
        description="Information extracted from this document."
      >
        <InfoRow
          label="Document Type"
          value={
            document.extracted_data?.documentType
              ? formatLabel(document.extracted_data.documentType)
              : "—"
          }
        />

        <InfoRow
          label="Category"
          value={
            document.extracted_data?.documentCategory
              ? formatLabel(document.extracted_data.documentCategory)
              : "—"
          }
        />

        <InfoRow
          label="Confidence"
          value={
            document.extracted_data?.confidence != null
              ? `${Math.round(document.extracted_data.confidence * 100)}%`
              : "—"
          }
        />

        <InfoRow
          label="Suggested Actions"
          value={
            document.extracted_data?.suggestedActions?.length
              ? document.extracted_data.suggestedActions
                  .map((action: string) => formatLabel(action))
                  .join(", ")
              : "None"
          }
        />
      </SectionCard>

      <SectionCard
        title="Original Document"
        description="Preview the file stored in Life Admin."
      >
        {documentUrl ? (
          <DocumentPreview
            fileName={document.file_name}
            fileType={document.file_type}
            signedUrl={documentUrl}
          />
        ) : (
          <p className="text-muted-foreground">
            Could not load the document preview.
          </p>
        )}
      </SectionCard>
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
    <div className="flex items-center justify-between border-b py-3 last:border-0">
      <span className="text-sm font-medium text-muted-foreground">
        {label}
      </span>

      <span className="font-medium">
        {value || "—"}
      </span>
    </div>
  );
}

function getStatusClasses(status: string) {
  switch (status) {
    case "processed":
      return "bg-green-100 text-green-700";

    case "processing":
      return "bg-yellow-100 text-yellow-700";

    case "failed":
      return "bg-red-100 text-red-700";

    default:
      return "bg-gray-100 text-gray-700";
  }
}

function formatLabel(value: string) {
  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

