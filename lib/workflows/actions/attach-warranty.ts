import { createWarranty } from "@/lib/warranties/create-warranty";
import { WorkflowContext } from "../types";

export async function attachWarrantyWorkflow(
  context: WorkflowContext
) {
  if (!context.assetId) {
    throw new Error("Cannot create warranty without an asset.");
  }

  const warranty = await createWarranty({
    assetId: context.assetId,
    documentId: context.documentId,

    provider: context.manufacturer,
    warrantyType: "Manufacturer Warranty",

    purchaseDate: context.purchaseDate,
    startDate: context.purchaseDate,
    expirationDate: context.expirationDate,

    durationMonths: context.warrantyMonths,

    notes: "",
  });

  return {
    warrantyId: warranty.id,
  };
}