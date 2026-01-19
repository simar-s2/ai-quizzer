"use client"

import { LazyMotion, domAnimation, m, useInView } from "framer-motion"
import { Upload, Settings, Zap, Trophy, type LucideIcon } from "lucide-react"
import { useRef } from "react"
import { useReducedMotionPreference } from "@/hooks/use-reduced-motion"

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

const ease = [0.25, 0.1, 0.25, 1]

const stepVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (delay: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay, ease },
  }),
}

export function HowItWorksSection() {
  const prefersReducedMotion = useReducedMotionPreference()
  const sectionRef = useRef<HTMLDivElement>(null)
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" })

  if (prefersReducedMotion) {
    return <HowItWorksSectionStatic />
  }

  return (
    <LazyMotion features={domAnimation}>
      <section id="how-it-works" className="py-24 bg-muted/30" ref={sectionRef}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <m.div
            className="text-center max-w-2xl mx-auto mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.5, ease }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">How it works</h2>
            <p className="text-lg text-muted-foreground">Create your first quiz in under a minute. It&apos;s that simple.</p>
          </m.div>

          <div className="relative">
            <ConnectingLine isInView={isInView} />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {steps.map((item, index) => (
                <StepCard
                  key={item.step}
                  step={item.step}
                  icon={item.icon}
                  title={item.title}
                  description={item.description}
                  delay={0.3 + index * 0.2}
                  isInView={isInView}
                />
              ))}
            </div>
          </div>
        </div>
      </section>
    </LazyMotion>
  )
}

function ConnectingLine({ isInView }: { isInView: boolean }) {
  return (
    <svg
      className="hidden lg:block absolute top-12 left-0 w-full h-px overflow-visible"
      preserveAspectRatio="none"
    >
      <m.line
        x1="12.5%"
        y1="0"
        x2="87.5%"
        y2="0"
        stroke="currentColor"
        strokeWidth="1"
        className="text-border"
        initial={{ pathLength: 0 }}
        animate={isInView ? { pathLength: 1 } : { pathLength: 0 }}
        transition={{ duration: 1.2, delay: 0.2, ease }}
      />
    </svg>
  )
}

function StepCard({
  step,
  icon: Icon,
  title,
  description,
  delay,
  isInView,
}: {
  step: string
  icon: LucideIcon
  title: string
  description: string
  delay: number
  isInView: boolean
}) {
  return (
    <m.div
      className="relative"
      variants={stepVariants}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      custom={delay}
    >
      <div className="text-center space-y-4">
        <div className="relative inline-flex">
          <m.div
            className="h-24 w-24 rounded-2xl bg-card border border-border flex items-center justify-center mx-auto"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={isInView ? { scale: 1, opacity: 1 } : { scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.4, delay: delay + 0.1, ease }}
          >
            <Icon className="h-10 w-10 text-primary" />
          </m.div>
          <m.span
            className="absolute -top-2 -right-2 h-8 w-8 rounded-full bg-primary text-primary-foreground text-sm font-bold flex items-center justify-center"
            initial={{ scale: 0, opacity: 0 }}
            animate={isInView ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
            transition={{ duration: 0.3, delay: delay + 0.2, ease }}
          >
            {step}
          </m.span>
        </div>
        <h3 className="text-xl font-semibold">{title}</h3>
        <p className="text-muted-foreground leading-relaxed">{description}</p>
      </div>
    </m.div>
  )
}

function HowItWorksSectionStatic() {
  return (
    <section id="how-it-works" className="py-24 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">How it works</h2>
          <p className="text-lg text-muted-foreground">Create your first quiz in under a minute. It&apos;s that simple.</p>
        </div>

        <div className="relative">
          <svg
            className="hidden lg:block absolute top-12 left-0 w-full h-px overflow-visible"
            preserveAspectRatio="none"
          >
            <line
              x1="12.5%"
              y1="0"
              x2="87.5%"
              y2="0"
              stroke="currentColor"
              strokeWidth="1"
              className="text-border"
            />
          </svg>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((item) => (
              <div key={item.step} className="relative">
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
      </div>
    </section>
  )
}
