"use client";

import {
  Download,
  ExternalLink,
  FileText,
  Maximize2,
} from "lucide-react";

import { Button } from "@/components/ui/button";

type DocumentPreviewProps = {
  fileName: string;
  fileType: string | null;
  signedUrl: string;
};

export default function DocumentPreview({
  fileName,
  fileType,
  signedUrl,
}: DocumentPreviewProps) {
  const normalizedType = fileType?.toLowerCase() ?? "";

  const isImage = normalizedType.startsWith("image/");
  const isPdf =
    normalizedType === "application/pdf" ||
    fileName.toLowerCase().endsWith(".pdf");

  function openDocument() {
    window.open(signedUrl, "_blank", "noopener,noreferrer");
  }

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-xl border bg-muted/30">
        <div className="flex items-center justify-between border-b bg-background px-4 py-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="rounded-lg bg-muted p-2">
              <FileText className="h-4 w-4" />
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-medium">
                {fileName}
              </p>

              <p className="text-xs text-muted-foreground">
                {fileType || "Unknown file type"}
              </p>
            </div>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={openDocument}
            aria-label="Open document in a new tab"
          >
            <Maximize2 className="h-4 w-4" />
          </Button>
        </div>

        <div className="bg-muted/20">
          {isImage ? (
            <div className="flex min-h-[400px] items-center justify-center p-4">
              <img
                src={signedUrl}
                alt={fileName}
                className="max-h-[700px] max-w-full rounded-lg object-contain"
              />
            </div>
          ) : isPdf ? (
            <iframe
              src={signedUrl}
              title={fileName}
              className="h-[700px] w-full bg-white"
            />
          ) : (
            <div className="flex min-h-[300px] flex-col items-center justify-center gap-3 p-8 text-center">
              <FileText className="h-10 w-10 text-muted-foreground" />

              <div>
                <p className="font-medium">
                  Preview unavailable
                </p>

                <p className="mt-1 text-sm text-muted-foreground">
                  Open the original file to view it.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={openDocument}
        >
          <ExternalLink className="mr-2 h-4 w-4" />
          Open Original
        </Button>

        <Button variant="outline" asChild>
          <a
            href={signedUrl}
            download={fileName}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Download className="mr-2 h-4 w-4" />
            Download
          </a>
        </Button>
      </div>
    </div>
  );
}