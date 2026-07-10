import { Card, CardContent } from "@/components/ui/card";

export default function PersonalRecordsPage() {
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
    </main>
  );
}