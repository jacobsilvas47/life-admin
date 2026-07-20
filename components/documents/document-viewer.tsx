type DocumentViewerProps = {
  fileName: string;
  documentUrl: string;
};

export default function DocumentViewer({
  fileName,
  documentUrl,
}: DocumentViewerProps) {
  const isPdf = fileName
    .toLowerCase()
    .endsWith(".pdf");

  return (
    <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
      <div className="flex items-center justify-between border-b px-5 py-4">
        <div>
          <h3 className="font-semibold">
            {fileName}
          </h3>

          <p className="text-sm text-muted-foreground">
            Original uploaded document
          </p>
        </div>

        <a
          href={documentUrl}
          target="_blank"
          rel="noreferrer"
          className="text-sm font-medium text-primary hover:underline"
        >
          Open Full Screen
        </a>
      </div>

      {isPdf ? (
        <iframe
          src={documentUrl}
          className="h-[700px] w-full"
        />
      ) : (
        <img
          src={documentUrl}
          alt={fileName}
          className="max-h-[700px] w-full object-contain bg-muted"
        />
      )}
    </div>
  );
}