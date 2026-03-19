"use client"

import { useAuth } from "@/components/providers/AuthProvider"
import { ProfileSection } from "@/features/settings/components/ProfileSection"
import { AppearanceSection } from "@/features/settings/components/AppearanceSection"
import { NotificationsSection } from "@/features/settings/components/NotificationsSection"
import { PreferencesSection } from "@/features/settings/components/PreferencesSection"
import { DataPrivacySection } from "@/features/settings/components/DataPrivacySection"
import { BillingSection } from "@/features/settings/components/BillingSection"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { User, Palette, Bell, Sliders, Shield, CreditCard } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import Spinner from "@/components/common/Spinner"
import { toast } from "sonner"

interface SubscriptionState {
  status: string
  currentPeriodEnd: string | null
  cancelAtPeriodEnd: boolean
}

export default function SettingsPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const userInitials = user?.email?.slice(0, 2).toUpperCase() ?? "U"

  const defaultTab = searchParams.get("tab") ?? "profile"
  const [subscription, setSubscription] = useState<SubscriptionState | null>(null)
  const [isSubscribed, setIsSubscribed] = useState(false)

  useEffect(() => {
    if (!loading && !user) router.push("/")
  }, [user, loading, router])

  useEffect(() => {
    if (searchParams.get("success")) toast.success("You're now on Quizzera Pro! 🎉")
    if (searchParams.get("canceled")) toast.info("Upgrade canceled.")
  }, [searchParams])

  useEffect(() => {
    if (!user) return
    fetch("/api/stripe/subscription")
      .then((r) => r.json())
      .then((data: { isSubscribed: boolean; subscription: SubscriptionState | null }) => {
        setIsSubscribed(data.isSubscribed)
        setSubscription(data.subscription)
      })
      .catch(() => {})
  }, [user])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner />
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground mt-1">Manage your account and preferences</p>
        </div>

        <Tabs defaultValue={defaultTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6 lg:w-auto lg:inline-flex">
            <TabsTrigger value="profile" className="gap-2">
              <User className="h-4 w-4 hidden sm:block" />Profile
            </TabsTrigger>
            <TabsTrigger value="appearance" className="gap-2">
              <Palette className="h-4 w-4 hidden sm:block" />Appearance
            </TabsTrigger>
            <TabsTrigger value="notifications" className="gap-2">
              <Bell className="h-4 w-4 hidden sm:block" />Notifications
            </TabsTrigger>
            <TabsTrigger value="preferences" className="gap-2">
              <Sliders className="h-4 w-4 hidden sm:block" />Preferences
            </TabsTrigger>
            <TabsTrigger value="privacy" className="gap-2">
              <Shield className="h-4 w-4 hidden sm:block" />Privacy
            </TabsTrigger>
            <TabsTrigger value="billing" className="gap-2">
              <CreditCard className="h-4 w-4 hidden sm:block" />Billing
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <ProfileSection email={user?.email} userInitials={userInitials} />
          </TabsContent>
          <TabsContent value="appearance"><AppearanceSection /></TabsContent>
          <TabsContent value="notifications"><NotificationsSection /></TabsContent>
          <TabsContent value="preferences"><PreferencesSection /></TabsContent>
          <TabsContent value="privacy"><DataPrivacySection /></TabsContent>
          <TabsContent value="billing">
            <BillingSection isSubscribed={isSubscribed} subscription={subscription} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}