import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { getAuthenticatedUser } from "@/lib/supabase/server";
import { createClient } from "@supabase/supabase-js";

interface StripeSchema {
  stripe: {
    Tables: {
      customers: {
        Row: { id: string; email: string; deleted: boolean };
      };
      subscriptions: {
        Row: { id: string; status: string };
      };
    };
  };
}

function adminClient() {
  return createClient<StripeSchema>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST() {
  const user = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const admin = adminClient();

  const { data: existing } = await admin
    .schema("stripe")
    .from("customers")
    .select("id")
    .eq("email", user.email!)
    .eq("deleted", false)
    .limit(1);

  let customerId: string | undefined = existing?.[0]?.id;

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email!,
      metadata: { supabase_user_id: user.id },
    });
    customerId = customer.id;
  }

  const { data: activeSubs } = await admin
    .schema("stripe")
    .from("subscriptions")
    .select("id")
    .eq("customer", customerId)
    .in("status", ["active", "trialing"])
    .limit(1);

  if (activeSubs && activeSubs.length > 0) {
    return NextResponse.json({ error: "Already subscribed" }, { status: 400 });
  }

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [{ price: process.env.STRIPE_PRICE_ID!, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings?tab=billing&success=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings?tab=billing&canceled=true`,
  });

  return NextResponse.json({ url: session.url });
}