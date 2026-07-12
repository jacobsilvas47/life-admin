type DocumentViewerProps = {
  fileName: string;
  fileType: string | null;
  signedUrl: string;
};

export default function DocumentViewer({
  fileName,
  fileType,
  signedUrl,
}: DocumentViewerProps) {
  const isImage =
    fileType?.startsWith("image/");

  return (
    <div className="space-y-4">

      <div className="rounded-xl border overflow-hidden bg-muted">

        {isImage ? (
          <img
            src={signedUrl}
            alt={fileName}
            className="w-full object-contain max-h-[700px]"
          />
        ) : (
          <iframe
            src={signedUrl}
            className="w-full h-[700px]"
          />
        )}

      </div>

      <div className="flex gap-3">

        <a
          href={signedUrl}
          target="_blank"
          className="rounded-lg border px-4 py-2"
        >
          Open
        </a>

        <a
          href={signedUrl}
          download={fileName}
          className="rounded-lg border px-4 py-2"
        >
          Download
        </a>

      </div>

    </div>
  );
}