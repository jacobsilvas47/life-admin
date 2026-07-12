import { supabaseServer } from "@/lib/supabase-server";
import { createActivity } from "@/lib/activity/create-activity";

type CreatePersonalRecordInput = {
  documentId?: string | null;
  recordType: string;
  title: string;
  issuingCountry?: string;
  issueDate?: string;
  expirationDate?: string;
  identifier?: string;
  metadata?: Record<string, unknown>;
};

export async function createPersonalRecord(
  input: CreatePersonalRecordInput
) {
  const { data: record, error } = await supabaseServer
    .from("personal_records")
    .insert({
      document_id: input.documentId ?? null,
      record_type: input.recordType,
      title: input.title,
      issuing_country: input.issuingCountry ?? null,
      issue_date: input.issueDate || null,
      expiration_date: input.expirationDate || null,
      identifier: input.identifier ?? null,
      metadata: input.metadata ?? {},
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  await createActivity({
    documentId: input.documentId ?? undefined,
    activityType: "personal_record_created",
    title: `Created personal record: ${input.title}`,
    metadata: {
      recordType: input.recordType,
    },
  });

  return record;
}