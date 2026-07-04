"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { uploadDocument } from "@/lib/storage";
import { createDocumentRecord } from "@/lib/documents";

export default function UploadDropzone() {
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (!acceptedFiles.length) return;

    try {
      setUploading(true);
      setMessage("");

      const file = acceptedFiles[0];

      const path = await uploadDocument(file);

      await createDocumentRecord(file, path);

      setMessage("Upload complete!");
    } catch (err: any) {
      console.error("Upload Error:", err);

      alert(JSON.stringify(err, null, 2));

      setMessage(err?.message ?? "Upload failed.");
    } finally {
      setUploading(false);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } =
    useDropzone({
      onDrop,
      multiple: false,
    });

  return (
    <div
      {...getRootProps()}
      className="rounded-xl border-2 border-dashed p-12 text-center transition hover:bg-muted cursor-pointer"
    >
      <input {...getInputProps()} />

      {uploading ? (
        <p>Uploading...</p>
      ) : isDragActive ? (
        <p>Drop your file...</p>
      ) : (
        <>
          <h2 className="text-xl font-semibold">
            Drag a document here
          </h2>

          <p className="mt-2 text-muted-foreground">
            or click to browse
          </p>
        </>
      )}

      {message && (
        <p className="mt-6 whitespace-pre-wrap text-sm">
          {message}
        </p>
      )}
    </div>
  );
}