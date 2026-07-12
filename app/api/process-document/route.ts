import OpenAI from "openai";
import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";
import { DOCUMENT_EXTRACTION_PROMPT } from "@/lib/ai/prompts";
import { getSuggestedActions } from "@/lib/ai/get-suggested-actions";
import { createActivity } from "@/lib/activity/create-activity";
import { convertHeicToJpeg } from "@/lib/images/convert-heic";

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

    const userContent: any[] = [
      {
        type: "input_text",
        text: "Analyze this uploaded document and extract the most useful structured information.",
      },
    ];

    const isHeic =
      document.file_type === "image/heic" ||
      document.file_type === "image/heif";

    if (isHeic) {
      const imageResponse = await fetch(signedUrlData.signedUrl);

      if (!imageResponse.ok) {
        throw new Error("Could not download the HEIC image.");
      }

      const heicBuffer = Buffer.from(
        await imageResponse.arrayBuffer()
      );

      const jpegBuffer = await convertHeicToJpeg(heicBuffer);
      const jpegBase64 = jpegBuffer.toString("base64");

      userContent.push({
        type: "input_image",
        image_url: `data:image/jpeg;base64,${jpegBase64}`,
        detail: "auto",
      });
    } else if (document.file_type.startsWith("image/")) {
      userContent.push({
        type: "input_image",
        image_url: signedUrlData.signedUrl,
        detail: "auto",
      });
    } else {
      userContent.push({
        type: "input_file",
        file_url: signedUrlData.signedUrl,
      });
    }

    const response = await openai.responses.create({
      model: "gpt-5-mini",
      input: [
          {
            role: "system",
            content: DOCUMENT_EXTRACTION_PROMPT,
          },
        {
          role: "user",
          content: userContent,
        },
      ],
    });

      let extracted;

      try {
        extracted = JSON.parse(response.output_text);
      } catch {
        console.error("Invalid AI response:");
        console.error(response.output_text);

        throw new Error("The AI returned an invalid response.");
      }

      extracted.suggestedActions = getSuggestedActions(
        extracted.documentCategory ?? "",
        extracted.recordType ??
          extracted.documentType ??
          ""
      );

      console.log("AI Extraction:", extracted);

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

    await createActivity({
      documentId,
      activityType: "document_processed",
      title: `Processed ${extracted.documentType || "document"}`,
      metadata: {
        category: extracted.documentCategory,
        confidence: extracted.confidence,
      },
    });

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