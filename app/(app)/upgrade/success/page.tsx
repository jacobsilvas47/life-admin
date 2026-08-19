import Link from "next/link";
import {
  BellRing,
  Check,
  FileText,
  ShieldCheck,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { getEntitlements } from "@/lib/subscriptions/get-entitlements";

export default async function UpgradeSuccessPage() {
  const entitlements = await getEntitlements();
  return (
    <main className="mx-auto max-w-3xl p-8">
      <div className="text-center">
        <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-black text-white">
          <Check className="size-7" />
        </div>

        <p className="mt-6 text-sm font-medium text-muted-foreground">
          Life Admin Premium
        </p>

        <h1 className="mt-2 text-4xl font-bold tracking-tight">
        {entitlements.isPremium
            ? "Welcome to Premium"
            : "Payment Successful"}
        </h1>

        <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground">
        {entitlements.isPremium
            ? "Your account has been upgraded. You now have access to the full Life Admin experience."
            : "Your payment was successful. We're finishing your Premium activation now."}
        </p>
      </div>

      <Card className="mt-10">
        <CardContent className="p-6">
          <h2 className="text-lg font-semibold">
            You&apos;ve unlocked
          </h2>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <PremiumFeature
              icon={<FileText className="size-5" />}
              title="Unlimited Documents"
              description="Keep all of your important documents organized in one place."
            />

            <PremiumFeature
              icon={<BellRing className="size-5" />}
              title="Advanced Reminders"
              description="Choose multiple alerts and get earlier warnings for important dates."
            />

            <PremiumFeature
              icon={<ShieldCheck className="size-5" />}
              title="Smarter Tracking"
              description="Stay ahead of warranties, expirations, renewals, and other important deadlines."
            />
          </div>
        </CardContent>
      </Card>

      <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
        <Button asChild>
          <Link href="/dashboard">
            Go to Dashboard
          </Link>
        </Button>

        <Button
          asChild
          variant="outline"
        >
          <Link href="/settings">
            View Premium Settings
          </Link>
        </Button>
      </div>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        You can manage your subscription anytime
        from Settings.
      </p>
    </main>
  );
}

function PremiumFeature({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-lg border p-4">
      <div className="flex size-9 items-center justify-center rounded-lg bg-muted">
        {icon}
      </div>

      <h3 className="mt-4 font-medium">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        {description}
      </p>
    </div>
  );
}