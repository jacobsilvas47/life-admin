import { NextResponse } from "next/server";
import Stripe from "stripe";

import { stripe } from "@/lib/stripe/stripe";
import { supabaseServer } from "@/lib/supabase-server";

function getCurrentPeriodEnd(
  subscription: Stripe.Subscription
) {
  const periodEnds =
    subscription.items.data
      .map((item) => item.current_period_end)
      .filter(
        (value): value is number =>
          typeof value === "number"
      );

  if (periodEnds.length === 0) {
    return null;
  }

  const latestPeriodEnd =
    Math.max(...periodEnds);

  return new Date(
    latestPeriodEnd * 1000
  ).toISOString();
}

function isPremiumStatus(
  status: Stripe.Subscription.Status
) {
  return (
    status === "active" ||
    status === "trialing"
  );
}

async function updateSubscriptionFromStripe(
  subscription: Stripe.Subscription
) {
  const customerId =
    typeof subscription.customer === "string"
      ? subscription.customer
      : subscription.customer.id;

  const userId =
    subscription.metadata.userId;

  /*
   * Prefer the user ID stored in Stripe
   * subscription metadata.
   *
   * If it isn't present, fall back to the
   * Stripe customer ID already stored in
   * our database.
   */
  let query = supabaseServer
    .from("subscriptions")
    .update({
      plan: isPremiumStatus(subscription.status)
        ? "premium"
        : "free",

      status: subscription.status,

      stripe_customer_id: customerId,

      stripe_subscription_id:
        subscription.id,

      current_period_end:
        getCurrentPeriodEnd(subscription),

      cancel_at_period_end:
        subscription.cancel_at_period_end ||
        subscription.cancel_at !== null,

      updated_at:
        new Date().toISOString(),
    });

  if (userId) {
    query = query.eq(
      "user_id",
      userId
    );
  } else {
    query = query.eq(
      "stripe_customer_id",
      customerId
    );
  }

  const { error } = await query;

  if (error) {
    throw error;
  }
}

export async function POST(request: Request) {
  const webhookSecret =
    process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    return NextResponse.json(
      {
        success: false,
        error:
          "STRIPE_WEBHOOK_SECRET is not configured.",
      },
      {
        status: 500,
      }
    );
  }

  const signature =
    request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      {
        success: false,
        error:
          "Missing Stripe signature.",
      },
      {
        status: 400,
      }
    );
  }

  try {
    /*
     * Signature verification MUST use the
     * untouched raw request body.
     *
     * Do not call request.json() here.
     */
    const body = await request.text();

    const event =
      stripe.webhooks.constructEvent(
        body,
        signature,
        webhookSecret
      );

    switch (event.type) {
      case "checkout.session.completed": {
        const session =
          event.data.object;

        /*
         * Checkout itself does not grant
         * Premium access.
         *
         * Retrieve the resulting Stripe
         * subscription and use its actual
         * status as our source of truth.
         */
        if (
          typeof session.subscription ===
          "string"
        ) {
          const subscription =
            await stripe.subscriptions.retrieve(
              session.subscription
            );

          await updateSubscriptionFromStripe(
            subscription
          );
        }

        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const subscription =
          event.data.object;

        await updateSubscriptionFromStripe(
          subscription
        );

        break;
      }

      default:
        break;
    }

    return NextResponse.json({
      received: true,
    });
  } catch (error: unknown) {
    console.error(
      "Stripe webhook error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Webhook processing failed.",
      },
      {
        status: 400,
      }
    );
  }
}