"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function ProcessDocumentButton({
  documentId,
}: {
  documentId: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function processDocument() {
    setLoading(true);

    const res = await fetch("/api/process-document", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ documentId }),
    });

    const json = await res.json();

    if (!json.success) {
      alert(json.error ?? "Processing failed.");
    }

    setLoading(false);
    router.refresh();
  }

  return (
    <Button
      onClick={processDocument}
      disabled={loading}
      size="sm"
    >
      {loading ? "Processing..." : "Process"}
    </Button>
  );
}