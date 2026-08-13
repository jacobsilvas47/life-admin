import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Check } from "lucide-react";

const premiumFeatures = [
  "Unlimited document storage",
  "Advanced reminder scheduling",
  "Multiple notification times per reminder",
  "Enhanced expiration and renewal tracking",
  "Advanced warranty reminders",
  "Access to future Premium features",
];

const freeFeatures = [
  "Up to 15 documents",
  "AI document processing",
  "Assets and personal records",
  "Basic reminders",
];

export default function UpgradePage() {
  return (
    <main className="mx-auto max-w-6xl space-y-10 p-8">
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-sm font-medium text-muted-foreground">
          Life Admin Premium
        </p>

        <h1 className="mt-2 text-4xl font-bold tracking-tight">
          Make Life Admin your permanent home
          for the things that matter.
        </h1>

        <p className="mt-4 text-lg text-muted-foreground">
          Start free, then upgrade when you want
          unlimited storage and more powerful
          reminders.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-4">
              <div>
                <CardTitle className="text-2xl">
                  Free
                </CardTitle>

                <p className="mt-2 text-muted-foreground">
                  Everything you need to start
                  organizing your life.
                </p>
              </div>

              <div className="text-right">
                <p className="text-3xl font-bold">
                  $0
                </p>

                <p className="text-sm text-muted-foreground">
                  forever
                </p>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="space-y-3">
              {freeFeatures.map((feature) => (
                <Feature
                  key={feature}
                  label={feature}
                />
              ))}
            </div>

            <Button
              asChild
              variant="outline"
              className="w-full"
            >
              <Link href="/dashboard">
                Continue with Free
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="border-black shadow-md">
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-3">
                  <CardTitle className="text-2xl">
                    Premium
                  </CardTitle>

                  <span className="rounded-full bg-black px-3 py-1 text-xs font-semibold text-white">
                    Best Experience
                  </span>
                </div>

                <p className="mt-2 text-muted-foreground">
                  For people who want Life Admin
                  to manage more of their life.
                </p>
              </div>

              <div className="text-right">
                <p className="text-3xl font-bold">
                  $9.99
                </p>

                <p className="text-sm text-muted-foreground">
                  per month
                </p>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="space-y-3">
              {premiumFeatures.map((feature) => (
                <Feature
                  key={feature}
                  label={feature}
                />
              ))}
            </div>

            <Button
              type="button"
              disabled
              className="w-full"
            >
              Upgrade to Premium
            </Button>

            <p className="text-center text-xs text-muted-foreground">
              Payments are not enabled yet.
            </p>
          </CardContent>
        </Card>
      </div>

      <section className="rounded-xl border bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold">
          What are Advanced Reminders?
        </h2>

        <p className="mt-2 text-muted-foreground">
          Free users can create and track reminders.
          Premium gives you more control over when
          and how Life Admin reminds you.
        </p>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <FeatureCard
            title="Multiple Alerts"
            description="Choose several notification times for the same reminder."
          />

          <FeatureCard
            title="Earlier Warnings"
            description="Get longer-term notice for important renewals and expirations."
          />

          <FeatureCard
            title="Smarter Scheduling"
            description="Life Admin can use the type of record or asset to suggest useful reminder timing."
          />
        </div>
      </section>
    </main>
  );
}

function Feature({
  label,
}: {
  label: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 rounded-full bg-black p-1 text-white">
        <Check className="size-3" />
      </div>

      <p className="text-sm">
        {label}
      </p>
    </div>
  );
}

function FeatureCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-lg border p-4">
      <h3 className="font-medium">
        {title}
      </h3>

      <p className="mt-2 text-sm text-muted-foreground">
        {description}
      </p>
    </div>
  );
}