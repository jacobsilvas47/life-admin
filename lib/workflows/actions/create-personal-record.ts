import { createPersonalRecord } from "@/lib/personal-records/create-personal-record";
import { WorkflowContext } from "../types";

export async function createPersonalRecordWorkflow(
  context: WorkflowContext
) {
  const record = await createPersonalRecord({
    documentId: context.documentId,

    recordType: context.recordType ?? "general",

    title:
      context.recordTitle ??
      context.assetName ??
      "Untitled Record",

    issuingCountry: context.issuingCountry,
    issueDate: context.issueDate,
    expirationDate: context.expirationDate,
    identifier: context.identifier,

    metadata: {},
  });

    return {
    personalRecordId: record.id,
    };
}