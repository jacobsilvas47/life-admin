import { supabaseServer } from "@/lib/supabase-server";
import PersonalRecordsList from "@/components/personal-records/personal-records-list";

export default async function PersonalRecordsPage() {
  const { data: records, error } = await supabaseServer
    .from("personal_records")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <main className="max-w-6xl mx-auto p-8">
        <p className="text-red-500">
          {error.message}
        </p>
      </main>
    );
  }

  return (
    <main className="max-w-6xl mx-auto p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">
          Personal Records
        </h1>

        <p className="mt-2 text-muted-foreground">
          Securely store and manage your most important personal documents.
        </p>
      </div>

      <PersonalRecordsList
        records={records ?? []}
      />
    </main>
  );
}