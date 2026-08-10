import { supabaseServer } from "@/lib/supabase-server";
import { createAuthServerClient } from "@/lib/supabase-auth-server";
import AssetsList from "@/components/assets/assets-list";

export default async function AssetsPage() {
  const authSupabase = await createAuthServerClient();

  const {
    data: { user },
  } = await authSupabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: assets, error } =
    await supabaseServer
      .from("assets")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", {
        ascending: false,
      });

  if (error) {
    return (
      <main className="max-w-5xl mx-auto p-8">
        <h1 className="text-3xl font-bold">
          Assets
        </h1>

        <p className="mt-4 text-red-500">
          {error.message}
        </p>
      </main>
    );
  }

  return (
    <main className="max-w-5xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-2">
        Assets
      </h1>

      <p className="text-gray-500 mb-8">
        Track your home, vehicles, appliances,
        electronics, and more.
      </p>

      <AssetsList assets={assets ?? []} />
    </main>
  );
}