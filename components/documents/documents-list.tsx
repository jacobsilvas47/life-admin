"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

import SearchBar from "@/components/ui/search-bar";
import ProcessDocumentButton from "@/components/process-document-button";
import DeleteDocumentButton from "@/components/documents/delete-document-button";
import { Button } from "@/components/ui/button";

type Document = {
  id: string;
  file_name: string;
  status: string;
};

export default function DocumentsList({
  documents,
}: {
  documents: Document[];
}) {
  const [search, setSearch] = useState("");

  const filteredDocuments = useMemo(() => {
    const query = search.toLowerCase().trim();

    if (!query) {
      return documents;
    }

    return documents.filter((doc) =>
      doc.file_name.toLowerCase().includes(query) ||
      doc.status.toLowerCase().includes(query)
    );
  }, [documents, search]);

  return (
    <>
      <SearchBar
        value={search}
        onChange={setSearch}
        placeholder="Search documents..."
      />

      <div className="space-y-4">
        {filteredDocuments.map((doc) => (
          <div
            key={doc.id}
            className="flex items-center justify-between rounded-lg border p-4 transition hover:bg-muted/30"
          >
            <div>
              <p className="font-semibold">
                {doc.file_name}
              </p>

              <p className="text-sm text-muted-foreground">
                Status: {doc.status}
              </p>
            </div>

            <div className="flex items-center gap-4">
              <Button
                asChild
                variant="ghost"
                size="sm"
              >
                <Link href={`/documents/${doc.id}`}>
                  View
                </Link>
              </Button>

              <Button
                asChild
                variant="outline"
                size="sm"
              >
                <Link href={`/documents/${doc.id}/review`}>
                  Review
                </Link>
              </Button>

              <ProcessDocumentButton
                documentId={doc.id}
              />

              <DeleteDocumentButton
                documentId={doc.id}
                fileName={doc.file_name}
              />
            </div>
          </div>
        ))}
      </div>
    </>
  );
}