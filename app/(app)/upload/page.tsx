import UploadDropzone from "@/components/upload-dropzone";

export default function UploadPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <div>
        <h1 className="text-5xl font-bold">
          Scan & Upload
        </h1>

        <p className="mt-4 text-muted-foreground">
          Upload receipts, warranties, manuals, IDs, and other important documents.
        </p>
      </div>

      <div className="mt-10">
        <UploadDropzone />
      </div>
    </div>
  );
}