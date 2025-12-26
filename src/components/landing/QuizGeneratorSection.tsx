"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FileText, Upload, Zap, Loader2 } from "lucide-react"
import QuizSettings from "@/components/QuizSettings"
import QuizPreview from "@/components/QuizPreview"
import type { Quiz, Question } from "@/lib/supabase/client"
import type { QuizSettingsType } from "@/types/quiz-settings"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/AuthProvider"
import { saveQuiz } from "@/lib/supabase/saveQuiz"
import { exportQuizQuestions, exportQuizMarkscheme } from "@/lib/quizExport"

export function QuizGeneratorSection() {
  const router = useRouter()
  const { user } = useAuth()

  const [questions, setQuestions] = useState<Question[]>([])
  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [loading, setLoading] = useState(false)
  const [rawText, setRawText] = useState("")
  const [files, setFiles] = useState<File[]>([])
  const [quizSettings, setQuizSettings] = useState<QuizSettingsType>({
    difficulty: "medium",
    numQuestions: 5,
    topic: "",
    type: { selectedTypes: [], distribution: { mcq: 0, fill: 0, truefalse: 0, shortanswer: 0, essay: 0 } },
  })

  const handleTextSubmit = async () => {
    if (!rawText.trim()) return
    setQuestions([])
    setQuiz(null)
    setLoading(true)

    try {
      const res = await fetch("/api/generate-quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: rawText, settings: quizSettings }),
      })
      const data = await res.json()
      if (data.error) {
        toast.error(data.error)
        return
      }
      setQuestions(Array.isArray(data.questions) ? data.questions : [])
      setQuiz(data.quiz ?? null)
      toast.success("Quiz generated successfully!")
    } catch (e) {
      console.error(e)
      toast.error("Failed to generate quiz")
    } finally {
      setLoading(false)
    }
  }

  const handlePdfUpload = async () => {
    if (!files.length) return
    setQuestions([])
    setQuiz(null)
    setLoading(true)

    try {
      const formData = new FormData()
      files.forEach((file) => formData.append("files", file))
      formData.append("settings", JSON.stringify(quizSettings))
      const res = await fetch("/api/generate-quiz", { method: "POST", body: formData })
      const data = await res.json()
      if (data.error) {
        toast.error(data.error)
        return
      }
      setQuestions(Array.isArray(data.questions) ? data.questions : [])
      setQuiz(data.quiz ?? null)
      toast.success("Quiz generated successfully!")
    } catch (e) {
      console.error(e)
      toast.error("Failed to generate quiz")
    } finally {
      setLoading(false)
    }
  }

  return (
    <section id="quiz-generator" className="py-24 border-t border-border/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Create your quiz</h2>
          <p className="text-lg text-muted-foreground">
            Paste your content or upload files to generate a personalized quiz.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7 space-y-6">
            <Card className="bg-card/50 border-border/50">
              <CardHeader>
                <h3 className="text-xl font-semibold">Input Content</h3>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="text" className="w-full">
                  <TabsList className="grid grid-cols-2 w-full">
                    <TabsTrigger value="text" className="gap-2">
                      <FileText className="h-4 w-4" />
                      Paste Text
                    </TabsTrigger>
                    <TabsTrigger value="upload" className="gap-2">
                      <Upload className="h-4 w-4" />
                      Upload PDF
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="text" className="mt-6 space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="raw-text">Your Content</Label>
                      <Textarea
                        id="raw-text"
                        value={rawText}
                        onChange={(e) => setRawText(e.target.value)}
                        placeholder="Paste your study notes, article, or learning material..."
                        className="min-h-56 bg-background"
                      />
                    </div>
                    <Button
                      onClick={handleTextSubmit}
                      disabled={loading || !rawText.trim()}
                      size="lg"
                      className="w-full"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Zap className="h-4 w-4 mr-2" />
                          Generate Quiz
                        </>
                      )}
                    </Button>
                  </TabsContent>

                  <TabsContent value="upload" className="mt-6 space-y-4">
                    <div className="border-2 border-dashed border-border rounded-xl p-8 bg-muted/30 hover:bg-muted/50 transition-colors">
                      <div className="flex flex-col items-center justify-center gap-3 text-center">
                        <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                          <Upload className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium mb-1">Upload PDF files</p>
                          <p className="text-sm text-muted-foreground">Drag and drop or click to browse</p>
                        </div>
                        <Input
                          id="files"
                          type="file"
                          multiple
                          accept=".pdf"
                          onChange={(e) => setFiles(Array.from(e.target.files || []))}
                          className="max-w-xs"
                        />
                      </div>
                      {!!files.length && (
                        <div className="mt-4 p-3 bg-background rounded-lg border">
                          <p className="text-sm font-medium mb-2">Selected ({files.length}):</p>
                          <ul className="text-xs text-muted-foreground space-y-1">
                            {files.map((f, idx) => (
                              <li key={idx} className="flex items-center gap-2">
                                <FileText className="h-3 w-3" />
                                {f.name}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                    <Button onClick={handlePdfUpload} disabled={loading || !files.length} size="lg" className="w-full">
                      {loading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Zap className="h-4 w-4 mr-2" />
                          Generate Quiz
                        </>
                      )}
                    </Button>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            <Card className="bg-card/50 border-border/50">
              <CardHeader>
                <h3 className="text-xl font-semibold">Quiz Settings</h3>
              </CardHeader>
              <CardContent>
                <QuizSettings quizSettings={quizSettings} setQuizSettings={setQuizSettings} />
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-24 space-y-4">
              <Card className="bg-card/50 border-border/50">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-semibold">Preview</h3>
                    {!!questions.length && <Badge variant="secondary">{questions.length} Questions</Badge>}
                  </div>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="flex flex-col items-center justify-center py-16">
                      <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                      <p className="text-sm text-muted-foreground">Generating your quiz...</p>
                    </div>
                  ) : questions.length > 0 && quiz ? (
                    <QuizPreview questions={questions} quiz={quiz} />
                  ) : (
                    <div className="py-16 text-center">
                      <div className="h-16 w-16 rounded-xl bg-muted flex items-center justify-center mx-auto mb-4">
                        <FileText className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <p className="font-medium mb-1">No quiz yet</p>
                      <p className="text-sm text-muted-foreground">Enter content and generate to preview</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {questions.length > 0 && quiz && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        exportQuizQuestions(questions, quiz)
                        toast.success("Exported!")
                      }}
                    >
                      Export Quiz
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        exportQuizMarkscheme(questions, quiz)
                        toast.success("Exported!")
                      }}
                    >
                      Export Answers
                    </Button>
                  </div>
                  {user && (
                    <>
                      <Button
                        size="lg"
                        className="w-full"
                        disabled={loading}
                        onClick={async () => {
                          setLoading(true)
                          try {
                            const id = await saveQuiz(quiz, questions)
                            if (!id) throw new Error("No quiz ID")
                            toast.success("Quiz started!")
                            router.push(`/quiz/${id}`)
                          } catch {
                            toast.error("Could not start quiz")
                          } finally {
                            setLoading(false)
                          }
                        }}
                      >
                        {loading ? "Starting..." : "Start Quiz Now"}
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full bg-transparent"
                        disabled={loading}
                        onClick={async () => {
                          setLoading(true)
                          try {
                            await saveQuiz(quiz, questions)
                            toast.success("Saved!")
                          } catch {
                            toast.error("Failed to save")
                          } finally {
                            setLoading(false)
                          }
                        }}
                      >
                        Save for Later
                      </Button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
