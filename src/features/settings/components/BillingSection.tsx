"use client"

import { useState } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Check, CreditCard, ExternalLink, CalendarDays, ShieldCheck, Zap } from "lucide-react"
import { toast } from "sonner"

interface Subscription {
  status: string
  currentPeriodEnd: string | null
  cancelAtPeriodEnd: boolean
}

interface BillingSectionProps {
  isSubscribed: boolean
  subscription: Subscription | null
}

const PRO_FEATURES = [
  "Unlimited AI-generated quizzes",
  "Advanced analytics & statistics",
  "Priority AI processing",
  "Export quizzes to PDF",
  "Spaced repetition scheduling",
  "All future Pro features",
]

export function BillingSection({ isSubscribed, subscription }: BillingSectionProps) {
  const [loading, setLoading] = useState(false)

  async function handleUpgrade() {
    setLoading(true)
    try {
      const res = await fetch("/api/stripe/create-checkout-session", { method: "POST" })
      const data = await res.json() as { url?: string; error?: string }
      if (data.url) {
        window.location.href = data.url
      } else {
        toast.error(data.error ?? "Something went wrong. Please try again.")
      }
    } catch {
      toast.error("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  async function handleManage() {
    setLoading(true)
    try {
      const res = await fetch("/api/stripe/create-portal-session", { method: "POST" })
      const data = await res.json() as { url?: string; error?: string }
      if (data.url) {
        window.location.href = data.url
      } else {
        toast.error(data.error ?? "Something went wrong. Please try again.")
      }
    } catch {
      toast.error("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-primary" />
            <CardTitle>Billing & Subscription</CardTitle>
          </div>
          <CardDescription>
            Manage your Quizzera Pro subscription and payment details
          </CardDescription>
        </CardHeader>
      </Card>

      {isSubscribed && subscription ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <Card className="border-primary/30 bg-primary/5">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Quizzera Pro</CardTitle>
                <Badge variant="default" className="text-xs">
                  {subscription.status === "trialing" ? "Trial" : "Active"}
                </Badge>
              </div>
              <CardDescription>Monthly subscription</CardDescription>
              <div className="flex items-baseline gap-1 pt-1">
                <span className="text-3xl font-bold">$7</span>
                <span className="text-sm text-muted-foreground">/mo</span>
              </div>
            </CardHeader>
            <CardContent className="pb-3">
              <ul className="space-y-2 text-sm">
                {PRO_FEATURES.map((f) => (
                  <li key={f} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter className="flex flex-col items-start gap-2 pt-0">
              {subscription.currentPeriodEnd && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <CalendarDays className="h-3.5 w-3.5" />
                  {subscription.cancelAtPeriodEnd
                    ? `Cancels ${new Date(subscription.currentPeriodEnd).toLocaleDateString()}`
                    : `Renews ${new Date(subscription.currentPeriodEnd).toLocaleDateString()}`}
                </div>
              )}
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <ShieldCheck className="h-3.5 w-3.5" />
                Payments secured by Stripe
              </div>
            </CardFooter>
          </Card>

          <Card className="border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Manage Subscription</CardTitle>
              <CardDescription>
                Update payment method, view invoices, or cancel anytime
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={handleManage}
                disabled={loading}
                variant="outline"
                className="w-full gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                {loading ? "Opening portal..." : "Open Billing Portal"}
              </Button>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-base">Free</CardTitle>
              <CardDescription>Current plan</CardDescription>
              <div className="flex items-baseline gap-1 pt-1">
                <span className="text-3xl font-bold">$0</span>
                <span className="text-sm text-muted-foreground">/mo</span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4" />5 AI quizzes/month
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4" />Basic statistics
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4" />Standard AI processing
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" disabled>
                Current Plan
              </Button>
            </CardFooter>
          </Card>

          <Card className="border-primary/50 bg-primary/5 relative overflow-hidden">
            <div className="absolute top-0 right-0">
              <Badge className="rounded-none rounded-bl-lg px-3 py-1 text-xs">
                Recommended
              </Badge>
            </div>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-primary" />
                <CardTitle className="text-base">Pro</CardTitle>
              </div>
              <CardDescription>Everything you need to master any subject</CardDescription>
              <div className="flex items-baseline gap-1 pt-1">
                <span className="text-3xl font-bold">$7</span>
                <span className="text-sm text-muted-foreground">/mo</span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                {PRO_FEATURES.map((f) => (
                  <li key={f} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button onClick={handleUpgrade} disabled={loading} className="w-full gap-2">
                <Zap className="h-4 w-4" />
                {loading ? "Redirecting to checkout..." : "Upgrade to Pro"}
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}

      <Separator />
      <p className="text-xs text-muted-foreground">
        Payments processed securely by Stripe. Cancel anytime from the billing portal.
      </p>
    </div>
  )
}