"use client"

import { LazyMotion, domAnimation, m, type Variants } from "framer-motion"
import { useReducedMotionPreference } from "@/hooks/use-reduced-motion"

type Direction = "up" | "down" | "left" | "right"

interface FadeInProps {
  children: React.ReactNode
  className?: string
  direction?: Direction
  delay?: number
  duration?: number
}

interface FadeInViewportProps extends FadeInProps {
  /** Trigger animation once when in view, or every time */
  once?: boolean
  /** Viewport margin for early/late trigger (e.g., "-100px") */
  margin?: string
}

const directionOffsets: Record<Direction, { x: number; y: number }> = {
  up: { x: 0, y: 20 },
  down: { x: 0, y: -20 },
  left: { x: 20, y: 0 },
  right: { x: -20, y: 0 },
}

/**
 * Fade-in animation that plays immediately on mount.
 */
export function FadeIn({
  children,
  className,
  direction = "up",
  delay = 0,
  duration = 0.5,
}: FadeInProps) {
  const prefersReducedMotion = useReducedMotionPreference()
  const offset = directionOffsets[direction]

  const variants: Variants = {
    hidden: {
      opacity: 0,
      x: offset.x,
      y: offset.y,
    },
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      transition: {
        duration,
        delay,
        ease: [0.25, 0.1, 0.25, 1],
      },
    },
  }

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>
  }

  return (
    <LazyMotion features={domAnimation}>
      <m.div
        className={className}
        variants={variants}
        initial="hidden"
        animate="visible"
      >
        {children}
      </m.div>
    </LazyMotion>
  )
}

/**
 * Fade-in animation triggered when element enters viewport.
 */
export function FadeInViewport({
  children,
  className,
  direction = "up",
  delay = 0,
  duration = 0.5,
  once = true,
  margin = "0px",
}: FadeInViewportProps) {
  const prefersReducedMotion = useReducedMotionPreference()
  const offset = directionOffsets[direction]

  const variants: Variants = {
    hidden: {
      opacity: 0,
      x: offset.x,
      y: offset.y,
    },
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      transition: {
        duration,
        delay,
        ease: [0.25, 0.1, 0.25, 1],
      },
    },
  }

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>
  }

  return (
    <LazyMotion features={domAnimation}>
      <m.div
        className={className}
        variants={variants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once, margin }}
      >
        {children}
      </m.div>
    </LazyMotion>
  )
}
