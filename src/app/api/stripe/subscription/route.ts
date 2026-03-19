import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/supabase/server";
import { createClient } from "@supabase/supabase-js";

function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function GET() {
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
    return NextResponse.json({ isSubscribed: false, subscription: null });
  }

  const { data: subs } = await admin
    .schema("stripe")
    .from("subscriptions")
    .select("id, status, current_period_end, cancel_at_period_end")
    .eq("customer", customers[0].id)
    .in("status", ["active", "trialing"])
    .order("created", { ascending: false })
    .limit(1);

  if (!subs || subs.length === 0) {
    return NextResponse.json({ isSubscribed: false, subscription: null });
  }

  const sub = subs[0];
  return NextResponse.json({
    isSubscribed: true,
    subscription: {
      status: sub.status,
      currentPeriodEnd: sub.current_period_end
        ? new Date(sub.current_period_end * 1000).toISOString()
        : null,
      cancelAtPeriodEnd: sub.cancel_at_period_end,
    },
  });
}