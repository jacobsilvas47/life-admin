import { supabase } from "./supabase";

export async function uploadDocument(file: File) {
  const fileName = `${Date.now()}-${file.name}`;

  const { data, error } = await supabase.storage
    .from("documents")
    .upload(fileName, file);

  if (error) throw error;

  return data.path;
}