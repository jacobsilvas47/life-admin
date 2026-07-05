"use client";

import { useState } from "react";

export default function AITestPage() {
  const [text, setText] = useState(`Costco Receipt

LG Refrigerator

Purchase Date: June 15, 2026

Price: $899

Warranty: 1 Year`);

  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  async function processDocument() {
    setLoading(true);

    const res = await fetch("/api/process-document", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text }),
    });

    const json = await res.json();

    setResult(JSON.stringify(json.result, null, 2));

    setLoading(false);
  }

  return (
    <main className="max-w-5xl mx-auto p-8 space-y-6">
      <h1 className="text-3xl font-bold">
        AI Playground
      </h1>

      <textarea
        className="w-full h-64 border rounded p-4"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />

      <button
        onClick={processDocument}
        disabled={loading}
        className="bg-black text-white px-6 py-3 rounded"
      >
        {loading ? "Processing..." : "Process with AI"}
      </button>

      <pre className="bg-gray-100 rounded p-4 overflow-auto">
        {result}
      </pre>
    </main>
  );
}