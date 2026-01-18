import { useReducedMotion } from "framer-motion"

/**
 * Returns true if the user has requested reduced motion in their OS settings.
 * SSR-safe: returns false during server render to avoid hydration mismatch.
 */
export function useReducedMotionPreference(): boolean {
  const prefersReducedMotion = useReducedMotion()
  return prefersReducedMotion ?? false
}
