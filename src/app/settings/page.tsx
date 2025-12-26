"use client"

import { useAuth } from "@/components/AuthProvider"
import { ProfileSection } from "@/components/settings/ProfileSection"
import { AppearanceSection } from "@/components/settings/AppearanceSection"
import { NotificationsSection } from "@/components/settings/NotificationsSection"
import { PreferencesSection } from "@/components/settings/PreferencesSection"
import { DataPrivacySection } from "@/components/settings/DataPrivacySection"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { User, Palette, Bell, Sliders, Shield } from "lucide-react"

export default function SettingsPage() {
  const { user } = useAuth()
  const userInitials = user?.email?.slice(0, 2).toUpperCase() || "U"

  return (
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground mt-1">Manage your account and preferences</p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:inline-flex">
            <TabsTrigger value="profile" className="gap-2">
              <User className="h-4 w-4 hidden sm:block" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="appearance" className="gap-2">
              <Palette className="h-4 w-4 hidden sm:block" />
              Appearance
            </TabsTrigger>
            <TabsTrigger value="notifications" className="gap-2">
              <Bell className="h-4 w-4 hidden sm:block" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="preferences" className="gap-2">
              <Sliders className="h-4 w-4 hidden sm:block" />
              Preferences
            </TabsTrigger>
            <TabsTrigger value="privacy" className="gap-2">
              <Shield className="h-4 w-4 hidden sm:block" />
              Privacy
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <ProfileSection email={user?.email} userInitials={userInitials} />
          </TabsContent>

          <TabsContent value="appearance">
            <AppearanceSection />
          </TabsContent>

          <TabsContent value="notifications">
            <NotificationsSection />
          </TabsContent>

          <TabsContent value="preferences">
            <PreferencesSection />
          </TabsContent>

          <TabsContent value="privacy">
            <DataPrivacySection />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
