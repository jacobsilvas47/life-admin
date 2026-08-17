"use client";

import { useState } from "react";
import { toast } from "sonner";

export default function ManageSubscriptionButton() {
  const [isLoading, setIsLoading] =
    useState(false);

  async function openPortal() {
    if (isLoading) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(
        "/api/stripe/create-portal-session",
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.error ??
            "Could not open billing portal."
        );
      }

      if (!result.url) {
        throw new Error(
          "Stripe did not return a portal URL."
        );
      }

      window.location.href = result.url;
    } catch (error: unknown) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Could not open billing portal."
      );

      setIsLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={openPortal}
      disabled={isLoading}
      className="rounded-lg border px-5 py-2.5 text-sm font-medium transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
    >
      {isLoading
        ? "Opening..."
        : "Manage Subscription"}
    </button>
  );
}