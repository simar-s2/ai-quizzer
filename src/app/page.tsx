"use client"

import { useAuth } from "@/components/providers/AuthProvider"
import { HeroSection } from "@/features/landing/components/HeroSection"
import { FeaturesSection } from "@/features/landing/components/FeaturesSection"
import { HowItWorksSection } from "@/features/landing/components/HowItWorksSection"
import { TestimonialsSection } from "@/features/landing/components/TestimonialsSection"
import { QuizGeneratorSection } from "@/features/quiz/components/QuizGeneratorSection"

export default function Home() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  // If user is logged in, show the quiz generator
  if (user) {
    return (
      <div className="min-h-screen">
        <QuizGeneratorSection />
      </div>
    )
  }

  // If not logged in, show landing page without quiz generator
  return (
    <div className="min-h-screen">
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <TestimonialsSection />

      {/* Footer */}
      <footer className="border-t border-border/40 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">© 2025 Quizzera. All rights reserved.</p>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <a href="#" className="hover:text-foreground transition-colors">
                Privacy
              </a>
              <a href="#" className="hover:text-foreground transition-colors">
                Terms
              </a>
              <a href="#" className="hover:text-foreground transition-colors">
                Contact
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
