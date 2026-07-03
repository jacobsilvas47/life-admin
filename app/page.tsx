import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background">
      <section className="mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center px-6 text-center">
        <div className="mb-6 rounded-full border px-4 py-2 text-sm text-muted-foreground">
          Your household&apos;s second brain
        </div>

        <h1 className="max-w-3xl text-5xl font-bold tracking-tight sm:text-6xl">
          Never lose track of life&apos;s important details again.
        </h1>

        <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
          Upload receipts, warranties, records, manuals, and IDs. Life Admin
          organizes them, extracts important dates, and reminds you before
          anything expires or needs attention.
        </p>

        <div className="mt-8 flex gap-4">
          <Button asChild size="lg">
            <Link href="/dashboard">Open Dashboard</Link>
          </Button>

          <Button asChild variant="outline" size="lg">
            <Link href="/upload">Scan Document</Link>
          </Button>
        </div>

        <div className="mt-12 grid w-full gap-4 sm:grid-cols-3">
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold">Smart Vault</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Store important documents, receipts, warranties, and records.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold">Auto Reminders</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Track expirations, maintenance, renewals, and due dates.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold">Life Graph</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Connect your home, cars, family, documents, and assets.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
}