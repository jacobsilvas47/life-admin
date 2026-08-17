import { cache } from "react";

import { supabaseServer } from "@/lib/supabase-server";
import { createAuthServerClient } from "@/lib/supabase-auth-server";

export type SubscriptionPlan =
  | "free"
  | "premium";

export type SubscriptionStatus =
  | "active"
  | "trialing"
  | "past_due"
  | "canceled";

export type UserSubscription = {
  id: string;
  userId: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  betaAccess: boolean;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
};

export const getUserSubscription = cache(
  async (): Promise<UserSubscription | null> => {
    const authSupabase =
      await createAuthServerClient();

    const {
      data: { user },
      error: authError,
    } = await authSupabase.auth.getUser();

    if (authError || !user) {
      return null;
    }

    const {
      data: subscription,
      error,
    } = await supabaseServer
      .from("subscriptions")
      .select(`
        id,
        plan,
        status,
        beta_access,
        current_period_end,
        cancel_at_period_end,
        stripe_customer_id,
        stripe_subscription_id
      `)
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }

    if (!subscription) {
      return null;
    }

    return {
      id: subscription.id,
      userId: user.id,
      plan:
        subscription.plan as SubscriptionPlan,
      status:
        subscription.status as SubscriptionStatus,
      betaAccess:
        subscription.beta_access ?? false,
      currentPeriodEnd:
        subscription.current_period_end ?? null,
      cancelAtPeriodEnd:
        subscription.cancel_at_period_end ?? false,
      stripeCustomerId:
        subscription.stripe_customer_id ?? null,
      stripeSubscriptionId:
        subscription.stripe_subscription_id ?? null,
    };
  }
);