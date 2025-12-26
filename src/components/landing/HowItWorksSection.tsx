import { Upload, Settings, Zap, Trophy } from "lucide-react"

const steps = [
  {
    step: "01",
    icon: Upload,
    title: "Upload Content",
    description: "Paste your text, upload PDFs, or import from your favorite note-taking apps.",
  },
  {
    step: "02",
    icon: Settings,
    title: "Customize Settings",
    description: "Choose difficulty level, question types, and the number of questions you want.",
  },
  {
    step: "03",
    icon: Zap,
    title: "Generate Quiz",
    description: "Our AI instantly creates a comprehensive quiz tailored to your content.",
  },
  {
    step: "04",
    icon: Trophy,
    title: "Learn & Improve",
    description: "Take the quiz, review your answers, and track your progress over time.",
  },
]

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-24 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">How it works</h2>
          <p className="text-lg text-muted-foreground">Create your first quiz in under a minute. It&apos;s that simple.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((item, index) => (
            <div key={item.step} className="relative">
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-12 left-full w-full h-px bg-border -translate-x-1/2" />
              )}
              <div className="text-center space-y-4">
                <div className="relative inline-flex">
                  <div className="h-24 w-24 rounded-2xl bg-card border border-border flex items-center justify-center mx-auto">
                    <item.icon className="h-10 w-10 text-primary" />
                  </div>
                  <span className="absolute -top-2 -right-2 h-8 w-8 rounded-full bg-primary text-primary-foreground text-sm font-bold flex items-center justify-center">
                    {item.step}
                  </span>
                </div>
                <h3 className="text-xl font-semibold">{item.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
