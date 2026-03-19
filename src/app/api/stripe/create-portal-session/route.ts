import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { getAuthenticatedUser } from "@/lib/supabase/server";
import { createClient } from "@supabase/supabase-js";

function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST() {
  const user = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const admin = adminClient();

  const { data: customers } = await admin
    .schema("stripe")
    .from("customers")
    .select("id")
    .eq("email", user.email!)
    .eq("deleted", false)
    .limit(1);

  if (!customers || customers.length === 0) {
    return NextResponse.json({ error: "No customer found" }, { status: 404 });
  }

  const portalSession = await stripe.billingPortal.sessions.create({
    customer: customers[0].id,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings?tab=billing`,
  });

  return NextResponse.json({ url: portalSession.url });
}