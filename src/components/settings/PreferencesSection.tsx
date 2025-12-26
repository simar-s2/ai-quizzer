"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Sliders } from "lucide-react"

export function PreferencesSection() {
  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Sliders className="h-5 w-5 text-primary" />
          <CardTitle>Quiz Preferences</CardTitle>
        </div>
        <CardDescription>Set your default quiz settings</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <p className="font-medium">Default Difficulty</p>
            <p className="text-sm text-muted-foreground">Starting difficulty for new quizzes</p>
          </div>
          <Select defaultValue="medium">
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="easy">Easy</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="hard">Hard</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <p className="font-medium">Default Questions</p>
            <p className="text-sm text-muted-foreground">Number of questions per quiz</p>
          </div>
          <Select defaultValue="10">
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5</SelectItem>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="15">15</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="25">25</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <p className="font-medium">Timer Mode</p>
            <p className="text-sm text-muted-foreground">Default timer for quizzes</p>
          </div>
          <Select defaultValue="none">
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No Timer</SelectItem>
              <SelectItem value="relaxed">Relaxed</SelectItem>
              <SelectItem value="standard">Standard</SelectItem>
              <SelectItem value="strict">Strict</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center justify-between py-2">
          <div className="space-y-0.5">
            <p className="font-medium">Auto-advance questions</p>
            <p className="text-sm text-muted-foreground">Move to next question after answering</p>
          </div>
          <Switch />
        </div>
        <div className="flex items-center justify-between py-2">
          <div className="space-y-0.5">
            <p className="font-medium">Show explanations</p>
            <p className="text-sm text-muted-foreground">Display explanations after each answer</p>
          </div>
          <Switch defaultChecked />
        </div>
      </CardContent>
    </Card>
  )
}
