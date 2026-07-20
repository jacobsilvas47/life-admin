import { createAsset } from "@/lib/assets/create-asset";
import { WorkflowContext } from "../types";

export async function createAssetWorkflow(
  context: WorkflowContext
) {
  const asset = await createAsset({
    documentId: context.documentId,
    assetName: context.assetName ?? "",
    manufacturer: context.manufacturer,
    model: context.model,
    serialNumber: context.serialNumber,
    purchaseDate: context.purchaseDate,
    category: context.category,
    notes: "",
  });

  return {
    assetId: asset.id,
  };
}