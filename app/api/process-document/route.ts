import OpenAI from "openai";
import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { documentId } = await req.json();

    if (!documentId) {
      return NextResponse.json(
        { success: false, error: "Missing documentId." },
        { status: 400 }
      );
    }

    await supabaseServer
      .from("documents")
      .update({ status: "processing", error_message: null })
      .eq("id", documentId);

    const { data: document, error: documentError } = await supabaseServer
      .from("documents")
      .select("*")
      .eq("id", documentId)
      .single();

    if (documentError || !document) {
      throw new Error(documentError?.message ?? "Document not found.");
    }

    const { data: signedUrlData, error: signedUrlError } =
      await supabaseServer.storage
        .from("documents")
        .createSignedUrl(document.file_path, 60);

    if (signedUrlError || !signedUrlData?.signedUrl) {
      throw new Error(signedUrlError?.message ?? "Could not create signed URL.");
    }

    const response = await openai.responses.create({
      model: "gpt-5-mini",
      input: [
        {
          role: "system",
          content: `
You extract structured information from household documents.

Return ONLY valid JSON using this schema:

{
  "documentType": "",
  "assetName": "",
  "manufacturer": "",
  "model": "",
  "serialNumber": "",
  "purchaseDate": "",
  "store": "",
  "price": null,
  "warrantyMonths": null,
  "category": "",
  "confidence": 0
}
`,
        },
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: "Analyze this uploaded household document and extract the most useful structured information.",
            },
            {
              type: "input_file",
              file_url: signedUrlData.signedUrl,
            },
          ],
        },
      ],
    });

    const extracted = JSON.parse(response.output_text);

    const { error: updateError } = await supabaseServer
      .from("documents")
      .update({
        status: "complete",
        extracted_data: extracted,
      })
      .eq("id", documentId);

    if (updateError) {
      throw new Error(updateError.message);
    }

    return NextResponse.json({
      success: true,
      result: extracted,
    });
  } catch (error: any) {
    console.error("Process document error:", error);

    return NextResponse.json(
      {
        success: false,
        error: error?.message ?? "Failed to process document.",
      },
      { status: 500 }
    );
  }
}