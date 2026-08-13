"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";
import {
  CheckCircle2,
  Clock3,
  Loader2,
  XCircle,
} from "lucide-react";

import { uploadDocument } from "@/lib/storage";
import { createDocumentRecord } from "@/lib/documents";
import Link from "next/link";
import { Button } from "@/components/ui/button";

type UploadStatus =
  | "queued"
  | "uploading"
  | "processing"
  | "success"
  | "error";

type UploadItem = {
  id: string;
  file: File;
  name: string;
  status: UploadStatus;
  documentId?: string;
  error?: string;
};

export default function UploadDropzone() {
  const [uploads, setUploads] = useState<UploadItem[]>([]);
  const [uploading, setUploading] = useState(false);

  const readyDocuments = uploads.filter(
    (upload) => upload.status === "success"
  ).length;

  const failedUploads = uploads.filter(
    (upload) => upload.status === "error"
  ).length;

  const progress =
    uploads.length === 0
      ? 0
      : Math.round(
          (readyDocuments / uploads.length) * 100
        );

  const importFinished =
    uploads.length > 0 &&
    !uploading &&
    readyDocuments + failedUploads === uploads.length;

    const reviewDocumentIds = uploads
      .filter(
        (upload) =>
          upload.status === "success" &&
          upload.documentId
      )
      .map((upload) => upload.documentId)
      .join(",");

      const reviewQueueHref = reviewDocumentIds
  ? `/documents/review-queue?ids=${encodeURIComponent(
      reviewDocumentIds
    )}`
  : "/documents";

  function updateUpload(
    id: string,
    updates: Partial<UploadItem>
  ) {
    setUploads((current) =>
      current.map((item) =>
        item.id === id
          ? { ...item, ...updates }
          : item
      )
    );
  }

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (!acceptedFiles.length || uploading) {
        return;
      }

  let importSession;

  try {
    const response = await fetch(
      "/api/import-session",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          totalDocuments: acceptedFiles.length,
        }),
      }
    );

    const result = await response.json();

    if (!response.ok || !result.success) {
      if (
        result.code ===
        "DOCUMENT_LIMIT_REACHED"
      ) {
        toast.error(result.error);
        return;
      }

      throw new Error(
        result.error ??
          "Failed to create import session."
      );
    }

    importSession = result.session;
  } catch (error: unknown) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to start document upload.";

    toast.error(message);
    return;
  }

      const queuedUploads: UploadItem[] =
        acceptedFiles.map((file) => ({
          id: crypto.randomUUID(),
          file,
          name: file.name,
          status: "queued",
        }));

      setUploads(queuedUploads);
      setUploading(true);

      try {
        const results = await Promise.all(
        queuedUploads.map(async (item) => {
          updateUpload(item.id, {
            status: "uploading",
          });

          try {
            const path = await uploadDocument(item.file);

            const createdDocument =
              await createDocumentRecord(
              item.file,
              path,
              importSession.id
            );

            updateUpload(item.id, {
              status: "processing",
              documentId: createdDocument.id,
            });

            const processResponse = await fetch(
              "/api/process-document",
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                documentId: createdDocument.id,
              }),
              }
            );

            const processResult = await processResponse.json();

            if (!processResponse.ok || !processResult.success) {
              throw new Error(
                processResult.error ??
                  "Document uploaded, but AI analysis failed."
              );
            }

            updateUpload(item.id, {
              status: "success",
            });

            return true;
          } catch (error: unknown) {
            const message =
              error instanceof Error
                ? error.message
                : "Upload failed.";

            updateUpload(item.id, {
              status: "error",
              error: message,
            });

            return false;
          }
        })
      );

      const successfulCount = results.filter(Boolean).length;
      const failedCount = results.length - successfulCount;

      if (failedCount > 0) {
        toast.warning(
          `${successfulCount} uploaded and ${failedCount} failed.`
        );
      } else {
        toast.success(
          `${successfulCount} document${
            successfulCount === 1 ? "" : "s"
          } uploaded successfully.`
        );
      }
      } finally {
        setUploading(false);
      }
    },
    [uploading]
  );

  const {
  getRootProps,
  getInputProps,
  isDragActive,
  open,
} = useDropzone({
    onDrop,
    multiple: true,
    disabled: uploading,
  });

  return (
    <div className="space-y-6">
      <div
        {...getRootProps()}
        className="cursor-pointer rounded-xl border-2 border-dashed p-12 text-center transition hover:bg-muted"
      >
        <input {...getInputProps()} />

        {uploading ? (
          <p>Uploading documents...</p>
        ) : isDragActive ? (
          <p>Drop your documents here...</p>
        ) : (
          <>
            <h2 className="text-xl font-semibold">
              Drag documents here
            </h2>

            <p className="mt-2 text-muted-foreground">
              or click to choose multiple files
            </p>
          </>
        )}
      </div>

      {uploads.length > 0 && (
  <>
    <div className="rounded-xl border bg-white p-5 shadow-sm">
    {importFinished ? (
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold">
            {failedUploads > 0
              ? "Import Finished"
              : "Your Documents Are Ready"}
          </h3>

          <p className="mt-1 text-sm text-muted-foreground">
            {readyDocuments} document
            {readyDocuments === 1 ? "" : "s"} analyzed and ready for review.
            {failedUploads > 0
              ? ` ${failedUploads} need attention.`
              : ""}
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button asChild>
            <Link href={reviewQueueHref}>
              Review Documents
            </Link>
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setUploads([]);
              open();
            }}
          >
            Upload More
          </Button>
        </div>
      </div>
    ) : (
      <>
        <div className="mb-2 flex items-center justify-between">
          <h3 className="font-semibold">
            Importing Documents
          </h3>

          <span className="text-sm font-medium">
            {progress}%
          </span>
        </div>

        <div className="h-2.5 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary/70 transition-all duration-300"
            style={{
              width: `${progress}%`,
            }}
          />
        </div>

        <p className="mt-2 text-sm text-muted-foreground">
          {readyDocuments} of {uploads.length} ready for review
        </p>

        {failedUploads > 0 && (
          <p className="mt-1 text-sm text-red-600">
            {failedUploads} failed
          </p>
        )}
      </>
    )}
  </div>

    <div className="rounded-xl border bg-white p-4 shadow-sm">

          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-semibold">
              Upload Queue
            </h3>

            <span className="text-sm text-muted-foreground">
              {readyDocuments} of {uploads.length} ready
            </span>
          </div>

          <div className="space-y-3">
            {uploads.map((item) => (
              <div
                key={item.id}
                className="flex items-start justify-between gap-4 rounded-lg border p-3"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium">
                    {item.name}
                  </p>

                  {item.error && (
                    <p className="mt-1 text-sm text-red-600">
                      {item.error}
                    </p>
                  )}
                </div>

                <UploadStatusLabel
                  status={item.status}
                />
              </div>
            ))}
          </div>
        </div>
      </>
      )}
    </div>
  );
}

function UploadStatusLabel({
  status,
}: {
  status: UploadStatus;
}) {
  const statusConfig: Record<
  UploadStatus,
  {
    label: string;
    className: string;
    icon: React.ReactNode;
  }
> = {
  queued: {
    label: "Waiting",
    className: "bg-muted text-muted-foreground",
    icon: <Clock3 className="size-4" />,
  },

  uploading: {
    label: "Uploading",
    className: "bg-blue-50 text-blue-700",
    icon: <Loader2 className="size-4 animate-spin" />,
  },

  processing: {
    label: "Analyzing",
    className: "bg-violet-50 text-violet-700",
    icon: <Loader2 className="size-4 animate-spin" />,
  },

  success: {
    label: "Ready for Review",
    className: "bg-green-50 text-green-700",
    icon: <CheckCircle2 className="size-4" />,
  },

  error: {
    label: "Needs Attention",
    className: "bg-red-50 text-red-700",
    icon: <XCircle className="size-4" />,
  },
};

  const config = statusConfig[status];

  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${config.className}`}
    >
      {config.icon}
      {config.label}
    </span>
  );
}