import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    console.log("Incoming body:", body);

    const {
      documentId,
      assetName,
      manufacturer,
      model,
      serialNumber,
      purchaseDate,
      category,
      notes,
    } = body;

    console.log("Looking for document:", documentId);

    const { data: document, error: documentError } = await supabaseServer
      .from("documents")
      .select("id")
      .eq("id", documentId)
      .single();

    if (documentError || !document) {
      throw new Error("Document not found.");
    }

    const { data: asset, error } = await supabaseServer
      .from("assets")
      .insert({
        name: assetName,
        manufacturer,
        model,
        serial_number: serialNumber,
        purchase_date: purchaseDate || null,
        category,
        notes,
      })
      .select()
      .single();

    if (error) throw error;

    await supabaseServer
      .from("asset_documents")
      .insert({
        asset_id: asset.id,
        document_id: documentId,
      });

    return NextResponse.json({
      success: true,
      asset,
    });
  } catch (error: any) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      {
        status: 500,
      }
    );
  }
}