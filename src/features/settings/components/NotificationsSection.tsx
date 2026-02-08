"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Bell } from "lucide-react"

const notifications = [
  { id: "reminders", label: "Quiz reminders", description: "Get reminded to complete pending quizzes" },
  { id: "weekly", label: "Weekly progress reports", description: "Receive weekly summaries of your performance" },
  { id: "achievements", label: "Achievement notifications", description: "Be notified when you earn new badges" },
  { id: "features", label: "New features", description: "Stay updated on new features and improvements" },
  { id: "tips", label: "Study tips", description: "Receive personalized learning recommendations" },
]

export function NotificationsSection() {
  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-primary" />
          <CardTitle>Notifications</CardTitle>
        </div>
        <CardDescription>Configure how you receive notifications</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {notifications.map((item) => (
          <div key={item.id} className="flex items-center justify-between py-2">
            <div className="space-y-0.5">
              <p className="font-medium">{item.label}</p>
              <p className="text-sm text-muted-foreground">{item.description}</p>
            </div>
            <Switch />
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
