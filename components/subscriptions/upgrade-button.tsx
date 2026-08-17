"use client";

import { useState } from "react";
import { toast } from "sonner";

export default function UpgradeButton() {
  const [isLoading, setIsLoading] =
    useState(false);

  async function startCheckout() {
    if (isLoading) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(
        "/api/stripe/create-checkout-session",
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.error ??
            "Could not start checkout."
        );
      }

      if (!result.url) {
        throw new Error(
          "Stripe did not return a checkout URL."
        );
      }

      /*
       * Send the user to Stripe's hosted
       * Checkout page.
       */
      window.location.href = result.url;
    } catch (error: unknown) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Could not start checkout."
      );

      setIsLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={startCheckout}
      disabled={isLoading}
      className="w-full rounded-md bg-black px-4 py-2 text-sm font-medium text-white transition hover:bg-black/90 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {isLoading
        ? "Opening Checkout..."
        : "Upgrade to Premium"}
    </button>
  );
}