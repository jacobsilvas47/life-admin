import { supabase } from "./supabase";

export async function createDocumentRecord(
  file: File,
  storagePath: string
) {
  const { data, error } = await supabase
    .from("documents")
    .insert({
      file_name: file.name,
      file_path: storagePath,
      file_type: file.type,
      file_size: file.size,
      status: "pending",
    })
    .select()
    .single();

  if (error) throw error;

  return data;
}