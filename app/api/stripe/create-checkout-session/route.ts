import { NextResponse } from "next/server";

import { stripe } from "@/lib/stripe/stripe";
import { createAuthServerClient } from "@/lib/supabase-auth-server";
import { supabaseServer } from "@/lib/supabase-server";

export async function POST(request: Request) {
  try {
    /*
     * Authenticate the Life Admin user.
     */
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

    const priceId =
      process.env.STRIPE_PREMIUM_PRICE_ID;

    if (!priceId) {
      throw new Error(
        "STRIPE_PREMIUM_PRICE_ID is not configured."
      );
    }

    /*
     * Look up the user's subscription record.
     *
     * If they already have a Stripe customer,
     * we'll reuse it instead of creating
     * duplicate customers.
     */
    const {
      data: subscription,
      error: subscriptionError,
    } = await supabaseServer
      .from("subscriptions")
      .select(`
        id,
        stripe_customer_id,
        stripe_subscription_id,
        plan,
        status
      `)
      .eq("user_id", user.id)
      .maybeSingle();

    if (subscriptionError) {
      throw subscriptionError;
    }

    let stripeCustomerId =
      subscription?.stripe_customer_id ?? null;

    /*
     * Create a Stripe customer the first time
     * this user enters the billing system.
     */
    if (!stripeCustomerId) {
      const customer =
        await stripe.customers.create({
          email: user.email,
          metadata: {
            userId: user.id,
          },
        });

      stripeCustomerId = customer.id;

      /*
       * Store the Stripe customer ID now so
       * future Checkout sessions can reuse it.
       */
      if (subscription) {
        const { error: updateError } =
          await supabaseServer
            .from("subscriptions")
            .update({
              stripe_customer_id:
                stripeCustomerId,
            })
            .eq("user_id", user.id);

        if (updateError) {
          throw updateError;
        }
      } else {
        const { error: insertError } =
          await supabaseServer
            .from("subscriptions")
            .insert({
              user_id: user.id,
              plan: "free",
              status: "active",
              stripe_customer_id:
                stripeCustomerId,
            });

        if (insertError) {
          throw insertError;
        }
      }
    }

    /*
     * Use the incoming request origin so this
     * works locally and on Vercel without
     * hardcoding the domain.
     */
    const origin = new URL(request.url).origin;

    /*
     * Create Stripe's hosted subscription
     * Checkout session.
     */
    const session =
      await stripe.checkout.sessions.create({
        mode: "subscription",

        customer: stripeCustomerId,

        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],

        success_url:
          `${origin}/upgrade/success`,

        cancel_url:
          `${origin}/upgrade?checkout=cancelled`,

        /*
         * This gives our webhook a reliable
         * connection back to the Life Admin user.
         */
        client_reference_id: user.id,

        metadata: {
          userId: user.id,
        },

        subscription_data: {
          metadata: {
            userId: user.id,
          },
        },
      });

    if (!session.url) {
      throw new Error(
        "Stripe did not return a Checkout URL."
      );
    }

    return NextResponse.json({
      success: true,
      url: session.url,
    });
  } catch (error: unknown) {
    console.error(
      "Create Stripe Checkout error:",
      error
    );

    const message =
      error instanceof Error
        ? error.message
        : "Could not start checkout.";

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