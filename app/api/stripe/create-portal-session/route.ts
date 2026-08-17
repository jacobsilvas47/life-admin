import { NextResponse } from "next/server";

import { stripe } from "@/lib/stripe/stripe";
import { createAuthServerClient } from "@/lib/supabase-auth-server";
import { supabaseServer } from "@/lib/supabase-server";

export async function POST(request: Request) {
  try {
    const authSupabase =
      await createAuthServerClient();

    const {
      data: { user },
      error: authError,
    } = await authSupabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized.",
        },
        {
          status: 401,
        }
      );
    }

    /*
     * Get this user's Stripe customer ID.
     */
    const {
      data: subscription,
      error: subscriptionError,
    } = await supabaseServer
      .from("subscriptions")
      .select("stripe_customer_id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (subscriptionError) {
      throw subscriptionError;
    }

    if (!subscription?.stripe_customer_id) {
      return NextResponse.json(
        {
          success: false,
          error:
            "No Stripe billing account was found.",
        },
        {
          status: 404,
        }
      );
    }

    const origin =
      new URL(request.url).origin;

    /*
     * Create a temporary Stripe Billing Portal
     * session for this customer.
     */
    const session =
      await stripe.billingPortal.sessions.create({
        customer:
          subscription.stripe_customer_id,

        return_url:
          `${origin}/settings`,
      });

    return NextResponse.json({
      success: true,
      url: session.url,
    });
  } catch (error: unknown) {
    console.error(
      "Create Stripe portal session error:",
      error
    );

    const message =
      error instanceof Error
        ? error.message
        : "Could not open billing portal.";

    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      {
        status: 500,
      }
    );
  }
}