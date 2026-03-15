import { getAuthenticatedUser } from "@/lib/supabase/server";
import { HeroSection } from "@/features/landing/components/HeroSection";
import { FeaturesSection } from "@/features/landing/components/FeaturesSection";
import { HowItWorksSection } from "@/features/landing/components/HowItWorksSection";
import { TestimonialsSection } from "@/features/landing/components/TestimonialsSection";
import { QuizGeneratorSection } from "@/features/quiz/components/QuizGeneratorSection";

export default async function Home() {
  const user = await getAuthenticatedUser();

  if (user) {
    return (
      <div className="min-h-screen">
        <QuizGeneratorSection />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <TestimonialsSection />

      <footer className="border-t border-border/40 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              © 2025 Quizzera. All rights reserved.
            </p>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
              <a href="#" className="hover:text-foreground transition-colors">Terms</a>
              <a href="#" className="hover:text-foreground transition-colors">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}