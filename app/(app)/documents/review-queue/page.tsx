import Link from "next/link";

import { supabaseServer } from "@/lib/supabase-server";
import BackButton from "@/components/ui/back-button";
import { Button } from "@/components/ui/button";
import DocumentPreview from "@/components/documents/document-preview";
import DocumentReviewForm from "@/components/document-review-form";

export default async function ReviewQueuePage({
  searchParams,
}: {
  searchParams: Promise<{
    ids?: string;
    index?: string;
  }>;
}) {
  const query = await searchParams;

  const ids = (query.ids ?? "")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);

  if (ids.length === 0) {
    return (
      <main className="mx-auto max-w-5xl space-y-6 p-8">
        <BackButton
          fallbackHref="/documents"
          label="Back to Documents"
        />

        <div className="rounded-xl border bg-white p-8 text-center shadow-sm">
          <h1 className="text-2xl font-bold">
            No documents to review
          </h1>

          <p className="mt-2 text-muted-foreground">
            Upload and analyze documents to begin a review queue.
          </p>

          <Button asChild className="mt-6">
            <Link href="/upload">
              Upload Documents
            </Link>
          </Button>
        </div>
      </main>
    );
  }

  const requestedIndex = Number(query.index ?? "0");

  const currentIndex = Number.isFinite(requestedIndex)
    ? Math.min(
        Math.max(requestedIndex, 0),
        ids.length - 1
      )
    : 0;

  const currentDocumentId = ids[currentIndex];

  const { data: document, error } = await supabaseServer
    .from("documents")
    .select("*")
    .eq("id", currentDocumentId)
    .single();

  if (error || !document) {
    return (
      <main className="mx-auto max-w-5xl space-y-6 p-8">
        <BackButton
          fallbackHref="/documents"
          label="Exit Review Queue"
        />

        <div className="rounded-xl border bg-white p-8 text-center shadow-sm">
          <h1 className="text-2xl font-bold">
            Document not found
          </h1>

          <p className="mt-2 text-muted-foreground">
            This document may have been deleted.
          </p>
        </div>
      </main>
    );
  }

  const { data: signedUrlData } =
    await supabaseServer.storage
      .from("documents")
      .createSignedUrl(
        document.file_path,
        60 * 60
      );

  const documentUrl =
    signedUrlData?.signedUrl ?? null;

  const previousIndex =
    currentIndex > 0
      ? currentIndex - 1
      : null;

  const nextIndex =
    currentIndex < ids.length - 1
      ? currentIndex + 1
      : null;

  const encodedIds = encodeURIComponent(
    ids.join(",")
  );

  const previousHref =
    previousIndex !== null
      ? `/documents/review-queue?ids=${encodedIds}&index=${previousIndex}`
      : null;

  const nextHref =
    nextIndex !== null
      ? `/documents/review-queue?ids=${encodedIds}&index=${nextIndex}`
      : "/documents";

  const progress =
    ((currentIndex + 1) / ids.length) * 100;

  return (
    <main className="mx-auto max-w-7xl space-y-6 p-8">
      <BackButton
        fallbackHref="/documents"
        label="Exit Review Queue"
      />

      <section className="rounded-xl border bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Review Queue
            </p>

            <h1 className="mt-1 text-3xl font-bold">
              Document {currentIndex + 1} of {ids.length}
            </h1>

            <p className="mt-2 text-muted-foreground">
              {document.file_name}
            </p>
          </div>

          <p className="text-sm font-medium text-muted-foreground">
            {Math.round(progress)}% through queue
          </p>
        </div>

        <div className="mt-5 h-2 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all duration-300"
            style={{
              width: `${progress}%`,
            }}
          />
        </div>
      </section>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <section className="rounded-xl border bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold">
            Original Document
          </h2>

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
        </section>

        <section className="rounded-xl border bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold">
            AI Extracted Information
          </h2>

          <DocumentReviewForm
            documentId={document.id}
            extractedData={document.extracted_data}
            successRedirectHref={nextHref}
            queueMode
          />
        </section>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          {previousHref && (
            <Button
              asChild
              variant="outline"
            >
              <Link href={previousHref}>
                ← Previous
              </Link>
            </Button>
          )}
        </div>

        <Button
          asChild
          variant="outline"
        >
          <Link href={nextHref}>
            {nextIndex !== null
              ? "Skip for Now →"
              : "Finish Review"}
          </Link>
        </Button>
      </div>
    </main>
  );
}