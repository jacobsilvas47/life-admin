"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";

import { createClient } from "@/lib/supabase";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] =
    useState(false);
  const [emailSent, setEmailSent] =
    useState(false);

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (isLoading) return;

    setIsLoading(true);

    try {
      const supabase = createClient();

      const origin = window.location.origin;

      const { error } =
        await supabase.auth.resetPasswordForEmail(
          email,
          {
            redirectTo: `${origin}/reset-password`,
          }
        );

      if (error) {
        throw error;
      }

      setEmailSent(true);

      toast.success(
        "Password reset email sent."
      );
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Could not send password reset email."
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/30 p-6">
      <div className="w-full max-w-md rounded-2xl border bg-white p-8 shadow-sm">
        <div className="mb-8">
          <p className="text-sm font-medium text-muted-foreground">
            Life Admin
          </p>

          <h1 className="mt-1 text-3xl font-bold">
            Reset your password
          </h1>

          <p className="mt-2 text-muted-foreground">
            Enter the email associated with your
            account and we&apos;ll send you a
            password reset link.
          </p>
        </div>

        {emailSent ? (
          <div>
            <div className="rounded-lg border bg-muted/30 p-4">
              <p className="font-medium">
                Check your email
              </p>

              <p className="mt-2 text-sm text-muted-foreground">
                If an account exists for{" "}
                <span className="font-medium text-foreground">
                  {email}
                </span>
                , you&apos;ll receive a password
                reset link shortly.
              </p>
            </div>

            <Link
              href="/login"
              className="mt-6 block text-center text-sm font-medium hover:underline"
            >
              Back to Sign In
            </Link>
          </div>
        ) : (
          <>
            <form
              onSubmit={handleSubmit}
              className="space-y-5"
            >
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block font-medium"
                >
                  Email
                </label>

                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(event) =>
                    setEmail(event.target.value)
                  }
                  placeholder="you@example.com"
                  className="w-full rounded-lg border bg-background p-3"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full rounded-lg bg-black px-6 py-3 font-medium text-white transition hover:bg-black/90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isLoading
                  ? "Sending..."
                  : "Send Reset Link"}
              </button>
            </form>

            <Link
              href="/login"
              className="mt-6 block text-center text-sm font-medium text-muted-foreground hover:text-foreground hover:underline"
            >
              Back to Sign In
            </Link>
          </>
        )}
      </div>
    </main>
  );
}