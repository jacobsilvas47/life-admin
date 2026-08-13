import { cache } from "react";

import { getUserSubscription } from "@/lib/subscriptions/get-user-subscription";

export const FREE_DOCUMENT_LIMIT = 15;

export type UserEntitlements = {
  isPremium: boolean;

  documentLimit: number | null;

  canUseAdvancedReminders: boolean;
  canUseUnlimitedDocuments: boolean;
};

export const getEntitlements = cache(
  async (): Promise<UserEntitlements> => {
    const subscription =
      await getUserSubscription();

    const hasPremiumAccess =
      subscription?.plan === "premium" &&
      (
        subscription.status === "active" ||
        subscription.status === "trialing"
      );

    /*
     * Beta users can receive Premium access
     * without having a paid Stripe subscription.
     */
    const isPremium =
      hasPremiumAccess ||
      subscription?.betaAccess === true;

    return {
      isPremium,

      documentLimit:
        isPremium
          ? null
          : FREE_DOCUMENT_LIMIT,

      canUseAdvancedReminders:
        isPremium,

      canUseUnlimitedDocuments:
        isPremium,
    };
  }
);