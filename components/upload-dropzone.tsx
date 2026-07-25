"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";

import { uploadDocument } from "@/lib/storage";
import { createDocumentRecord } from "@/lib/documents";

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

  const progress =
    uploads.length === 0
      ? 0
      : Math.round(
          (completedUploads / uploads.length) * 100
        );

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
        await Promise.all(
          queuedUploads.map(async (item) => {
            updateUpload(item.id, {
              status: "uploading",
            });

            try {
              const path = await uploadDocument(
                item.file
              );

              await createDocumentRecord(
                item.file,
                path
              );

              updateUpload(item.id, {
                status: "success",
              });
            } catch (error: unknown) {
              const message =
                error instanceof Error
                  ? error.message
                  : "Upload failed.";

              updateUpload(item.id, {
                status: "error",
                error: message,
              });
            }
          })
        );

        toast.success(
          `${acceptedFiles.length} document${
            acceptedFiles.length === 1 ? "" : "s"
          } finished uploading.`
        );
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
    <div className="rounded-xl border bg-white p-4 shadow-sm">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="font-semibold">
          Overall Progress
        </h3>

        <span className="text-sm font-medium">
          {progress}%
        </span>
      </div>

      <div className="h-3 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full bg-primary transition-all duration-300"
          style={{
            width: `${progress}%`,
          }}
        />
      </div>

      <p className="mt-2 text-sm text-muted-foreground">
        {completedUploads} of {uploads.length} uploaded
      </p>
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
  const labels: Record<
    UploadStatus,
    string
  > = {
    queued: "Queued",
    uploading: "Uploading...",
    success: "Uploaded",
    error: "Failed",
  };

  return (
    <span className="shrink-0 text-sm text-muted-foreground">
      {labels[status]}
    </span>
  );
}