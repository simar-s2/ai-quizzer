"use client"

import { LazyMotion, domAnimation, m } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Zap, ArrowRight, Play } from "lucide-react"
import Link from "next/link"
import { useReducedMotionPreference } from "@/hooks/use-reduced-motion"

const ease = [0.25, 0.1, 0.25, 1]

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: (delay: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay, ease },
  }),
}

const scaleFadeIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: (delay: number) => ({
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, delay, ease },
  }),
}

const backgroundFade = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 0.5,
    transition: { duration: 1.5, ease },
  },
}

export function HeroSection() {
  const prefersReducedMotion = useReducedMotionPreference()

  if (prefersReducedMotion) {
    return <HeroSectionStatic />
  }

  return (
    <LazyMotion features={domAnimation}>
      <section className="relative overflow-hidden min-h-screen flex items-center">
        <div className="absolute inset-0 -z-10">
          <m.div
            className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-primary/30 rounded-full blur-[150px]"
            variants={backgroundFade}
            initial="hidden"
            animate="visible"
          />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="text-center max-w-4xl mx-auto space-y-8">
            <m.div
              variants={scaleFadeIn}
              initial="hidden"
              animate="visible"
              custom={0.1}
            >
              <Badge variant="secondary" className="px-4 py-1.5 text-sm font-medium">
                <Zap className="h-3.5 w-3.5 mr-1.5" />
                AI-Powered Learning Platform
              </Badge>
            </m.div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1]">
              <m.span
                className="block"
                variants={fadeIn}
                initial="hidden"
                animate="visible"
                custom={0.2}
              >
                Turn any content into
              </m.span>
              <m.span
                className="block text-primary"
                variants={fadeIn}
                initial="hidden"
                animate="visible"
                custom={0.3}
              >
                interactive quizzes
              </m.span>
            </h1>

            <m.p
              className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
              variants={fadeIn}
              initial="hidden"
              animate="visible"
              custom={0.4}
            >
              Upload your study materials, and our AI will instantly generate personalized quizzes. Track your progress,
              identify weak areas, and master any subject faster.
            </m.p>

            <m.div
              className="flex flex-col sm:flex-row gap-4 justify-center pt-4"
              variants={fadeIn}
              initial="hidden"
              animate="visible"
              custom={0.4}
            >
              <Button size="lg" className="h-12 px-8 text-base gap-2" asChild>
                <Link href="/auth">
                  Start Creating
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="h-12 px-8 text-base gap-2 bg-transparent">
                <Play className="h-4 w-4" />
                Watch Demo
              </Button>
            </m.div>

            <m.div
              className="pt-8 flex items-center justify-center gap-8 text-sm text-muted-foreground"
              variants={fadeIn}
              initial="hidden"
              animate="visible"
              custom={0.6}
            >
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-500" />
                Free to use
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-500" />
                No credit card required
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-500" />
                Instant results
              </div>
            </m.div>
          </div>
        </div>
      </section>
    </LazyMotion>
  )
}

function HeroSectionStatic() {
  return (
    <section className="relative overflow-hidden min-h-screen flex items-center">
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-primary/30 rounded-full blur-[150px] opacity-50" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="text-center max-w-4xl mx-auto space-y-8">
          <Badge variant="secondary" className="px-4 py-1.5 text-sm font-medium">
            <Zap className="h-3.5 w-3.5 mr-1.5" />
            AI-Powered Learning Platform
          </Badge>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1]">
            <span className="block">Turn any content into</span>
            <span className="block text-primary">interactive quizzes</span>
          </h1>

          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Upload your study materials, and our AI will instantly generate personalized quizzes. Track your progress,
            identify weak areas, and master any subject faster.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button size="lg" className="h-12 px-8 text-base gap-2" asChild>
              <Link href="/auth">
                Start Creating
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="h-12 px-8 text-base gap-2 bg-transparent">
              <Play className="h-4 w-4" />
              Watch Demo
            </Button>
          </div>

          <div className="pt-8 flex items-center justify-center gap-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-500" />
              Free to use
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-500" />
              No credit card required
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-500" />
              Instant results
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
