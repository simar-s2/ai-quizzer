"use client"

import { LazyMotion, domAnimation, m } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Star } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useReducedMotionPreference } from "@/hooks/use-reduced-motion"

const testimonials = [
  {
    name: "Sarah Chen",
    role: "Medical Student",
    content:
      "Quizzera transformed how I study for my exams. The AI-generated questions are incredibly relevant and helped me identify gaps in my knowledge.",
    rating: 5,
  },
  {
    name: "James Miller",
    role: "High School Teacher",
    content:
      "I create practice tests for my students in minutes now. The variety of question types keeps my students engaged and challenged.",
    rating: 5,
  },
  {
    name: "Emily Rodriguez",
    role: "Law Student",
    content:
      "The instant feedback and detailed explanations are game-changers. I've improved my test scores significantly since using Quizzera.",
    rating: 5,
  },
]

const ease = [0.25, 0.1, 0.25, 1]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
}

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease },
  },
}

const starVariants = {
  hidden: { opacity: 0, scale: 0 },
  visible: (i: number) => ({
    opacity: 1,
    scale: 1,
    transition: { duration: 0.2, delay: i * 0.08, ease },
  }),
}

export function TestimonialsSection() {
  const prefersReducedMotion = useReducedMotionPreference()

  if (prefersReducedMotion) {
    return <TestimonialsSectionStatic />
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
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Loved by learners everywhere</h2>
            <p className="text-lg text-muted-foreground">
              Join thousands of students and educators who are learning smarter.
            </p>
          </m.div>

          <m.div
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
          >
            {testimonials.map((testimonial) => (
              <TestimonialCard
                key={testimonial.name}
                name={testimonial.name}
                role={testimonial.role}
                content={testimonial.content}
                rating={testimonial.rating}
              />
            ))}
          </m.div>
        </div>
      </section>
    </LazyMotion>
  )
}

function TestimonialCard({
  name,
  role,
  content,
  rating,
}: {
  name: string
  role: string
  content: string
  rating: number
}) {
  return (
    <m.div variants={cardVariants}>
      <Card className="bg-card/50 border-border/50 h-full">
        <CardContent className="pt-6 space-y-4">
          <div className="flex gap-1">
            {[...Array(rating)].map((_, i) => (
              <m.div key={i} variants={starVariants} custom={i}>
                <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
              </m.div>
            ))}
          </div>
          <p className="text-muted-foreground leading-relaxed">&quot;{content}&quot;</p>
          <div className="flex items-center gap-3 pt-2">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-primary/20 text-primary text-sm font-semibold">
                {name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold text-sm">{name}</p>
              <p className="text-xs text-muted-foreground">{role}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </m.div>
  )
}

function TestimonialsSectionStatic() {
  return (
    <section className="py-24 border-t border-border/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Loved by learners everywhere</h2>
          <p className="text-lg text-muted-foreground">
            Join thousands of students and educators who are learning smarter.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((testimonial) => (
            <Card key={testimonial.name} className="bg-card/50 border-border/50">
              <CardContent className="pt-6 space-y-4">
                <div className="flex gap-1">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                  ))}
                </div>
                <p className="text-muted-foreground leading-relaxed">&quot;{testimonial.content}&quot;</p>
                <div className="flex items-center gap-3 pt-2">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-primary/20 text-primary text-sm font-semibold">
                      {testimonial.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-sm">{testimonial.name}</p>
                    <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
