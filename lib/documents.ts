import { createClient } from "./supabase";

export async function createDocumentRecord(
  file: File,
  storagePath: string,
  importSessionId: string
) {
  const supabase = createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error(
      "You must be signed in to upload documents."
    );
  }

  const { data, error } = await supabase
    .from("documents")
    .insert({
      user_id: user.id,
      file_name: file.name,
      file_path: storagePath,
      file_type: file.type,
      file_size: file.size,
      status: "pending",
      import_session_id: importSessionId,
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}