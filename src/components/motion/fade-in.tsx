"use client"

import { LazyMotion, domAnimation, m, type Variants } from "framer-motion"
import { useReducedMotionPreference } from "@/hooks/use-reduced-motion"

type Direction = "up" | "down" | "left" | "right"

interface FadeInStaggerProps {
  children: React.ReactNode
  className?: string
  staggerDelay?: number
  /** Delay before the stagger sequence begins (seconds) */
  delay?: number
}

interface FadeInItemProps {
  children: React.ReactNode
  className?: string
  /** Animation direction */
  direction?: Direction
  /** Delay before this item animates (seconds) */
  delay?: number
  /** Animation duration (seconds) */
  duration?: number
}

const directionOffsets: Record<Direction, { x: number; y: number }> = {
  up: { x: 0, y: 20 },
  down: { x: 0, y: -20 },
  left: { x: 20, y: 0 },
  right: { x: -20, y: 0 },
}

export function FadeInStagger({
  children,
  className,
  staggerDelay = 0.1,
  delay = 0,
}: FadeInStaggerProps) {
  const prefersReducedMotion = useReducedMotionPreference()

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: delay,
        staggerChildren: staggerDelay,
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
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {children}
      </m.div>
    </LazyMotion>
  )
}

export function FadeInItem({
  children,
  className,
  direction = "up",
  delay = 0,
  duration = 0.5,
}: FadeInItemProps) {
  const prefersReducedMotion = useReducedMotionPreference()
  const offset = directionOffsets[direction]

  const itemVariants: Variants = {
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
    <m.div className={className} variants={itemVariants}>
      {children}
    </m.div>
  )
}
