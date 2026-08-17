import SettingsForm from "@/components/settings/settings-form";
import { getUserSettings } from "@/lib/settings/get-user-settings";
import { getEntitlements } from "@/lib/subscriptions/get-entitlements";
import { getUserSubscription } from "@/lib/subscriptions/get-user-subscription";
import { supabaseServer } from "@/lib/supabase-server";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import ManageSubscriptionButton from "@/components/subscriptions/manage-subscription-button";

function formatBillingDate(
  dateString: string | null
) {
  if (!dateString) {
    return null;
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(dateString));
}

export default async function SettingsPage() {
  const settings = await getUserSettings();
  const subscription = await getUserSubscription();
  const entitlements = await getEntitlements();

  const billingDate = formatBillingDate(
  subscription?.currentPeriodEnd ?? null
);

  const { count: documentCount } =
  await supabaseServer
    .from("documents")
    .select("*", {
      count: "exact",
      head: true,
    })
    .eq("user_id", subscription?.userId ?? "");

  return (
    <main className="max-w-5xl mx-auto p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">
          Settings
        </h1>

        <p className="mt-2 text-muted-foreground">
          Manage your display and notification
          preferences.
        </p>
      </div>

      <section className="mb-8 rounded-xl border bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-semibold">
                Your Plan
              </h2>

              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  entitlements.isPremium
                    ? "bg-black text-white"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                {entitlements.isPremium
                  ? "Premium"
                  : "Free"}
              </span>
            </div>

            <div className="mt-2 space-y-1">
              <p className="text-sm text-muted-foreground">
                {entitlements.isPremium
                  ? "You have access to all Life Admin Premium features."
                  : "You're currently using the Life Admin Free plan."}
              </p>

              {entitlements.isPremium &&
                subscription?.stripeSubscriptionId &&
                billingDate && (
                  <p className="text-sm font-medium">
                    {subscription.cancelAtPeriodEnd
                      ? `Cancels ${billingDate}`
                      : `Renews ${billingDate}`}
                  </p>
                )}

              {entitlements.isPremium &&
                subscription?.betaAccess &&
                !subscription.stripeSubscriptionId && (
                  <p className="text-sm font-medium">
                    Premium beta access
                  </p>
                )}
            </div>
          </div>

          {entitlements.isPremium ? (
            subscription?.stripeCustomerId ? (
              <ManageSubscriptionButton />
            ) : (
              <span className="text-sm text-muted-foreground">
                Premium access
              </span>
            )
          ) : (
            <Button asChild>
              <Link href="/upgrade">
                Upgrade to Premium
              </Link>
            </Button>
          )}
        </div>

        <div className="mt-6 border-t pt-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="font-medium">
                Document Storage
              </p>

              <p className="mt-1 text-sm text-muted-foreground">
                {entitlements.isPremium
                  ? "Unlimited document storage"
                  : `${documentCount ?? 0} of ${entitlements.documentLimit} documents used`}
              </p>
            </div>

            {!entitlements.isPremium &&
              entitlements.documentLimit !== null && (
                <span className="text-sm font-medium">
                  {Math.max(
                    entitlements.documentLimit -
                      (documentCount ?? 0),
                    0
                  )}{" "}
                  remaining
                </span>
              )}
          </div>

          {!entitlements.isPremium &&
            entitlements.documentLimit !== null && (
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-gray-100">
                <div
                  className="h-full rounded-full bg-black transition-all"
                  style={{
                    width: `${Math.min(
                      ((documentCount ?? 0) /
                        entitlements.documentLimit) *
                        100,
                      100
                    )}%`,
                  }}
                />
              </div>
            )}
        </div>

        <div className="mt-6 grid gap-3 border-t pt-6 sm:grid-cols-2">
          <div className="rounded-lg border p-4">
            <p className="font-medium">
              Documents
            </p>

            <p className="mt-1 text-sm text-muted-foreground">
              {entitlements.canUseUnlimitedDocuments
                ? "Unlimited"
                : `Up to ${entitlements.documentLimit}`}
            </p>
          </div>

          <div className="rounded-lg border p-4">
            <p className="font-medium">
              Reminders
            </p>

            <p className="mt-1 text-sm text-muted-foreground">
              {entitlements.canUseAdvancedReminders
                ? "Advanced reminders"
                : "Basic reminders"}
            </p>
          </div>
        </div>
      </section>

      <SettingsForm
        settings={settings}
        canUseAdvancedReminders={
          entitlements.canUseAdvancedReminders
        }
      />
    </main>
  );
}