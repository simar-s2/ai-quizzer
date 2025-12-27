import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Book, MessageCircle, Mail, HelpCircle } from "lucide-react"
import Link from "next/link"

const faqs = [
  {
    q: "How do I create a quiz?",
    a: "Simply paste your study content or upload a PDF on the home page, configure your quiz settings, and click 'Generate Quiz'. Our AI will create relevant questions automatically.",
  },
  {
    q: "What file formats are supported?",
    a: "Currently, we support PDF files and plain text. You can upload multiple PDFs at once or paste text directly into the text area.",
  },
  {
    q: "How is my quiz scored?",
    a: "Multiple choice, true/false, and fill-in-the-blank questions are scored automatically. Essay and short answer questions receive AI-powered feedback with suggested scores.",
  },
  {
    q: "Can I retake quizzes?",
    a: "Yes! You can retake any quiz as many times as you want. Each attempt is saved separately so you can track your improvement over time.",
  },
  {
    q: "How do I export my quizzes?",
    a: "After generating a quiz, you can export it as a PDF using the 'Export Quiz' or 'Export Answers' buttons. You can also save quizzes to your dashboard for later.",
  },
  {
    q: "Is my data secure?",
    a: "Yes, we take data security seriously. All data is encrypted in transit and at rest. We never share your personal information or study materials with third parties.",
  },
]

export default function HelpPage() {
  return (
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">Help & Support</h1>
          <p className="text-muted-foreground">Find answers or get in touch with our team</p>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-card/50 border-border/50 hover:border-primary/50 transition-colors">
            <CardContent className="pt-6 text-center">
              <Book className="h-10 w-10 text-primary mx-auto mb-3" />
              <h3 className="font-semibold mb-1">Documentation</h3>
              <p className="text-sm text-muted-foreground">Learn how to use Quizzera</p>
            </CardContent>
          </Card>
          <Card className="bg-card/50 border-border/50 hover:border-primary/50 transition-colors">
            <CardContent className="pt-6 text-center">
              <MessageCircle className="h-10 w-10 text-green-500 mx-auto mb-3" />
              <h3 className="font-semibold mb-1">Community</h3>
              <p className="text-sm text-muted-foreground">Join our Discord community</p>
            </CardContent>
          </Card>
          <Card className="bg-card/50 border-border/50 hover:border-primary/50 transition-colors">
            <CardContent className="pt-6 text-center">
              <Mail className="h-10 w-10 text-blue-500 mx-auto mb-3" />
              <h3 className="font-semibold mb-1">Contact Us</h3>
              <p className="text-sm text-muted-foreground">Get in touch with support</p>
            </CardContent>
          </Card>
        </div>

        {/* FAQs */}
        <Card className="bg-card/50 border-border/50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5 text-muted-foreground" />
              <CardTitle>Frequently Asked Questions</CardTitle>
            </div>
            <CardDescription>Quick answers to common questions</CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, i) => (
                <AccordionItem key={i} value={`item-${i}`}>
                  <AccordionTrigger className="text-left">{faq.q}</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">{faq.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>

        {/* Contact */}
        <Card className="bg-gradient-to-br from-primary/20 to-primary/5 border-primary/20">
          <CardContent className="py-8 text-center">
            <h3 className="text-xl font-semibold mb-2">Still need help?</h3>
            <p className="text-muted-foreground mb-4">Our support team is here to assist you</p>
            <Button asChild>
              <Link href="mailto:support@quizzera.com">
                <Mail className="h-4 w-4 mr-2" />
                Contact Support
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
