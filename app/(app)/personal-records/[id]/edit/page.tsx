import { notFound } from "next/navigation";
import { supabaseServer } from "@/lib/supabase-server";
import BackButton from "@/components/ui/back-button";
import PersonalRecordEditForm from "@/components/personal-records/personal-record-edit-form";

export default async function EditPersonalRecordPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const { data: record, error } = await supabaseServer
    .from("personal_records")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !record) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-3xl space-y-6 p-8">
      <BackButton
        fallbackHref={`/personal-records/${record.id}`}
        label="Back to Personal Record"
      />

      <div>
        <h1 className="text-3xl font-bold">
          Edit Personal Record
        </h1>

        <p className="text-muted-foreground mt-2">
          Update this personal record.
        </p>
      </div>

      <PersonalRecordEditForm record={record} />
    </main>
  );
}