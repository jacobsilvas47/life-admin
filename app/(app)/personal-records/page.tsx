import { Card, CardContent } from "@/components/ui/card";
import { supabaseServer } from "@/lib/supabase-server";
import Link from "next/link";

export default async function PersonalRecordsPage() {

  const { data: records, error } = await supabaseServer
  .from("personal_records")
  .select("*")
  .order("created_at", { ascending: false });

if (error) {
  return (
    <main className="max-w-6xl mx-auto p-8">
      <p className="text-red-500">{error.message}</p>
    </main>
  );
}

  return (
    <main className="max-w-6xl mx-auto p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">
          Personal Records
        </h1>

        <p className="text-muted-foreground mt-2">
          Securely store and manage your most important personal documents.
        </p>
      </div>

      {records && records.length > 0 ? (
        <div className="grid gap-4">
          {records.map((record) => (
            <Link
                key={record.id}
                href={`/personal-records/${record.id}`}
              >
                <Card className="hover:border-black transition cursor-pointer">
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold">
                  {record.title}
                </h2>

                <p className="text-sm text-muted-foreground">
                  {record.record_type.replaceAll("_", " ")}
                </p>

                {record.expiration_date && (
                  <p className="mt-2 text-sm">
                    Expires: {record.expiration_date}
                  </p>
                )}
              </CardContent>
            </Card>
            </Link>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-16 text-center">
            <h2 className="text-xl font-semibold">
              No personal records yet
            </h2>

            <p className="text-muted-foreground mt-2">
              Upload a passport, driver's license, vehicle registration,
              birth certificate, insurance card, or any other important
              document.
            </p>
          </CardContent>
        </Card>
      )}
    </main>
  );
}