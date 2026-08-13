import { supabaseServer } from "@/lib/supabase-server";
import { createAuthServerClient } from "@/lib/supabase-auth-server";
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
  const authSupabase =
    await createAuthServerClient();

  const {
    data: { user },
    error: authError,
  } = await authSupabase.auth.getUser();

  if (authError || !user) {
    throw new Error(
      "You must be signed in to create a personal record."
    );
  }

  /*
   * If this personal record is being created
   * from a document, verify that the document
   * belongs to the authenticated user.
   */
  let documentId: string | null = null;

  if (input.documentId) {
    const {
      data: document,
      error: documentError,
    } = await supabaseServer
      .from("documents")
      .select("id")
      .eq("id", input.documentId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (documentError) {
      throw documentError;
    }

    if (!document) {
      throw new Error("Document not found.");
    }

    documentId = document.id;
  }

  /*
   * Create the personal record under the
   * authenticated user's account.
   */
  const { data: record, error } =
    await supabaseServer
      .from("personal_records")
      .insert({
        user_id: user.id,
        document_id: documentId,
        record_type: input.recordType,
        title: input.title,
        issuing_country:
          input.issuingCountry ?? null,
        issue_date: input.issueDate || null,
        expiration_date:
          input.expirationDate || null,
        identifier: input.identifier ?? null,
        metadata: input.metadata ?? {},
      })
      .select()
      .single();

  if (error) {
    throw new Error(error.message);
  }

  await createActivity({
    personalRecordId: record.id,
    documentId: documentId ?? undefined,
    activityType: "personal_record_created",
    title: `Created personal record: ${input.title}`,
    metadata: {
      recordType: input.recordType,
    },
  });

  return record;
}