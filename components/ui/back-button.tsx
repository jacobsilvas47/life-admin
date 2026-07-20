"use client";

import { useRouter } from "next/navigation";

type BackButtonProps = {
  fallbackHref?: string;
  label?: string;
};

export default function BackButton({
  fallbackHref = "/dashboard",
  label = "Back",
}: BackButtonProps) {
  const router = useRouter();

  function handleClick() {
    // If the user has navigation history, go back.
    if (window.history.length > 1) {
      router.back();
      return;
    }

    // Otherwise fall back to a sensible page.
    router.push(fallbackHref);
  }

  return (
    <button
      onClick={handleClick}
      className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition hover:text-foreground"
    >
      ← {label}
    </button>
  );
}