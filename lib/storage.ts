import { createClient } from "./supabase";

export async function uploadDocument(
  file: File
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

  const fileName =
    `${Date.now()}-${file.name}`;

  const filePath =
    `${user.id}/${fileName}`;

  const { data, error } =
    await supabase.storage
      .from("documents")
      .upload(filePath, file);

  if (error) {
    throw error;
  }

  return data.path;
}