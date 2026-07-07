import UploadDropzone from "@/components/upload-dropzone";
import Link from "next/link";

export default function UploadPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <div className="flex items-start justify-between gap-6">
        <div>
          <h1 className="text-5xl font-bold">
            Scan & Upload
          </h1>

          <p className="mt-4 text-muted-foreground">
            Upload receipts, warranties, manuals, IDs, and other important documents.
          </p>
        </div>

        <Link
          href="/documents"
          className="rounded-lg bg-black px-5 py-3 text-white hover:bg-gray-800 transition"
        >
          View Uploaded Documents
        </Link>
      </div>

      <div className="mt-10">
        <UploadDropzone />
      </div>
    </div>
  );
}