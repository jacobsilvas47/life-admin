import { supabaseServer } from "@/lib/supabase-server";
import { createAuthServerClient } from "@/lib/supabase-auth-server";
import DocumentsList from "@/components/documents/documents-list";

export default async function DocumentsPage() {
  const authSupabase = await createAuthServerClient();

  const {
    data: { user },
  } = await authSupabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: documents, error } =
    await supabaseServer
      .from("documents")
      .select("*")
      .eq("user_id", user.id)
      .order("uploaded_at", {
        ascending: false,
      });

  if (error) {
    return (
      <main className="mx-auto max-w-5xl px-5 py-8 md:p-8">
        <h1 className="text-3xl font-bold">
          Documents
        </h1>

        <p className="mt-4 text-red-500">
          {error.message}
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-5xl px-5 py-8 md:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">
          Uploaded Documents
        </h1>

        <p className="mt-2 text-muted-foreground">
          Store, search, and manage your important
          documents in one place.
        </p>
      </div>

      <DocumentsList
        documents={documents ?? []}
      />
    </main>
  );
}