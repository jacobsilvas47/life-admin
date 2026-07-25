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
  | "success"
  | "error";

type UploadItem = {
  id: string;
  file: File;
  name: string;
  status: UploadStatus;
  error?: string;
};

export default function UploadDropzone() {
  const [uploads, setUploads] = useState<UploadItem[]>([]);
  const [uploading, setUploading] = useState(false);

  const completedUploads = uploads.filter(
    (upload) => upload.status === "success"
  ).length;

  const failedUploads = uploads.filter(
    (upload) => upload.status === "error"
  ).length;

  const progress =
    uploads.length === 0
      ? 0
      : Math.round(
          (completedUploads / uploads.length) * 100
        );

  const uploadFinished =
    uploads.length > 0 &&
    !uploading &&
    completedUploads + failedUploads === uploads.length;

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

            await createDocumentRecord(
              item.file,
              path
            );

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
    {uploadFinished ? (
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold">
            {failedUploads > 0
              ? "Upload Finished"
              : "Upload Complete"}
          </h3>

          <p className="mt-1 text-sm text-muted-foreground">
            {completedUploads} document
            {completedUploads === 1 ? "" : "s"} uploaded successfully.
            {failedUploads > 0
              ? ` ${failedUploads} failed.`
              : ""}
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button asChild>
            <Link href="/documents">
              View Uploaded Documents
            </Link>
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={() => setUploads([])}
          >
            Upload More
          </Button>
        </div>
      </div>
    ) : (
      <>
        <div className="mb-2 flex items-center justify-between">
          <h3 className="font-semibold">
            Overall Progress
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
          {completedUploads} of {uploads.length} uploaded
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
              {
                uploads.filter(
                  (item) =>
                    item.status === "success"
                ).length
              }{" "}
              of {uploads.length} complete
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
      label: "Queued",
      className: "bg-muted text-muted-foreground",
      icon: <Clock3 className="size-4" />,
    },

    uploading: {
      label: "Uploading",
      className: "bg-blue-50 text-blue-700",
      icon: <Loader2 className="size-4 animate-spin" />,
    },

    success: {
      label: "Uploaded",
      className: "bg-green-50 text-green-700",
      icon: <CheckCircle2 className="size-4" />,
    },

    error: {
      label: "Failed",
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