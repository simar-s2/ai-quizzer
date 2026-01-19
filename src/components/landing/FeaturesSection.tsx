"use client"

import { LazyMotion, domAnimation, m } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Brain, Target, BarChart3, Clock, Sparkles, Shield, type LucideIcon } from "lucide-react"
import { useReducedMotionPreference } from "@/hooks/use-reduced-motion"

const features = [
  {
    icon: Brain,
    title: "AI-Powered Generation",
    description: "Our advanced AI analyzes your content and creates relevant, challenging questions automatically.",
  },
  {
    icon: Target,
    title: "Multiple Question Types",
    description: "MCQ, True/False, Fill-in-the-blank, Short Answer, and Essay questions to test different skills.",
  },
  {
    icon: BarChart3,
    title: "Detailed Analytics",
    description: "Track your performance over time with comprehensive statistics and progress reports.",
  },
  {
    icon: Clock,
    title: "Instant Feedback",
    description: "Get immediate results with AI-powered explanations for each answer you submit.",
  },
  {
    icon: Sparkles,
    title: "Adaptive Difficulty",
    description: "Quizzes adjust to your skill level, ensuring you're always challenged but never overwhelmed.",
  },
  {
    icon: Shield,
    title: "Save & Export",
    description: "Save quizzes to your library, export as PDF, and share with classmates or students.",
  },
]

const ease = [0.25, 0.1, 0.25, 1]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease },
  },
}

const iconVariants = {
  hidden: { scale: 0.8, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: { duration: 0.3, delay: 0.2, ease },
  },
}

export function FeaturesSection() {
  const prefersReducedMotion = useReducedMotionPreference()

  if (prefersReducedMotion) {
    return <FeaturesSectionStatic />
  }

  return (
    <LazyMotion features={domAnimation}>
      <section className="py-24 border-t border-border/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <m.div
            className="text-center max-w-2xl mx-auto mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5, ease }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Everything you need to learn faster</h2>
            <p className="text-lg text-muted-foreground">
              Powerful features designed to help you study smarter, not harder.
            </p>
          </m.div>

          <m.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
          >
            {features.map((feature) => (
              <FeatureCard
                key={feature.title}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
              />
            ))}
          </m.div>
        </div>
      </section>
    </LazyMotion>
  )
}

function FeatureCard({
  icon: Icon,
  title,
  description,
}: {
  icon: LucideIcon
  title: string
  description: string
}) {
  return (
    <m.div variants={cardVariants}>
      <Card className="bg-card/50 border-border/50 hover:border-primary/50 transition-colors h-full">
        <CardContent className="pt-6">
          <m.div
            className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4"
            variants={iconVariants}
          >
            <Icon className="h-6 w-6 text-primary" />
          </m.div>
          <h3 className="text-lg font-semibold mb-2">{title}</h3>
          <p className="text-muted-foreground leading-relaxed">{description}</p>
        </CardContent>
      </Card>
    </m.div>
  )
}

function FeaturesSectionStatic() {
  return (
    <section className="py-24 border-t border-border/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Everything you need to learn faster</h2>
          <p className="text-lg text-muted-foreground">
            Powerful features designed to help you study smarter, not harder.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <Card key={feature.title} className="bg-card/50 border-border/50 hover:border-primary/50 transition-colors">
              <CardContent className="pt-6">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
