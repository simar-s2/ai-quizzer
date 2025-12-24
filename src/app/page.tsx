"use client";

import { useState } from "react";
import QuizPreview from "@/components/QuizPreview";
import Spinner from "@/components/Spinner";
import QuizSettings from "@/components/QuizSettings";
import { Quiz, Question } from "@/lib/supabase/client";
import { saveQuiz } from "@/lib/supabase/saveQuiz";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { exportQuizMarkscheme, exportQuizQuestions } from "@/lib/quizExport";
import { useAuth } from "@/components/AuthProvider";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { QuizSettingsType } from "@/types/quiz-settings";

export default function Home() {
  // State
  const [questions, setQuestions] = useState<Question[]>([]);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(false);
  const [quizSettings, setQuizSettings] = useState<QuizSettingsType>({
    difficulty: "medium",
    numQuestions: 5,
    topic: "",
    type: {
      selectedTypes: [],
      distribution: {
        mcq: 0,
        fill: 0,
        truefalse: 0,
        shortanswer: 0,
        essay: 0,
      },
    },
  });

  // Router and Auth
  const router = useRouter();
  const { user } = useAuth();

  // Local form state
  const [rawText, setRawText] = useState("");
  const [files, setFiles] = useState<File[]>([]);

  // Actions
  const handleTextSubmit = async () => {
    if (!rawText.trim()) return;
    setQuestions([]);
    setQuiz(null);
    setLoading(true);

    try {
      const res = await fetch("/api/generate-quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: rawText, settings: quizSettings }),
      });
      const data = await res.json();

      if (data.error) {
        toast.error(data.error);
        return;
      }

      setQuestions(Array.isArray(data.questions) ? data.questions : []);
      setQuiz(data.quiz ?? null);
      toast.success("Quiz generated successfully!");
    } catch (e) {
      console.error(e);
      toast.error("Failed to generate quiz");
    } finally {
      setLoading(false);
    }
  };

  const handlePdfUpload = async () => {
    if (!files.length) return;
    setQuestions([]);
    setQuiz(null);
    setLoading(true);

    try {
      const formData = new FormData();
      files.forEach((file) => formData.append("files", file));
      formData.append("settings", JSON.stringify(quizSettings));

      const res = await fetch("/api/generate-quiz", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (data.error) {
        toast.error(data.error);
        return;
      }

      setQuestions(Array.isArray(data.questions) ? data.questions : []);
      setQuiz(data.quiz ?? null);
      toast.success("Quiz generated successfully!");
    } catch (e) {
      console.error(e);
      toast.error("Failed to generate quiz");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="max-w-2xl">
          <h1 className="text-4xl font-bold">
            Generate quizzes from your documents or notes
          </h1>
          <p className="mt-2 text-slate-600">
            Upload PDFs or paste text. Tune settings. Preview instantly.
          </p>
        </div>
      </section>

      {/* Main */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Form + Settings */}
          <div className="lg:col-span-7 space-y-6">
            <Card>
              <CardHeader>
                <div>
                  <h3 className="text-lg font-semibold">Quiz generation</h3>
                  <p className="text-sm text-muted-foreground">
                    Choose input method and generate your questions.
                  </p>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="text" className="w-full">
                  <TabsList className="grid grid-cols-2">
                    <TabsTrigger value="text">Paste text</TabsTrigger>
                    <TabsTrigger value="upload">Upload documents</TabsTrigger>
                  </TabsList>

                  {/* Paste text */}
                  <TabsContent value="text" className="mt-4">
                    <div className="space-y-3">
                      <Label htmlFor="raw-text">Your text</Label>
                      <Textarea
                        id="raw-text"
                        value={rawText}
                        onChange={(e) => setRawText(e.target.value)}
                        placeholder="Paste your notes, article, or study material here..."
                        className="min-h-56 p-4 text-base rounded-lg"
                      />
                    </div>
                    <CardFooter className="px-0 pt-4">
                      <div className="flex items-center gap-3">
                        <Button
                          onClick={handleTextSubmit}
                          disabled={loading || !rawText.trim()}
                        >
                          {loading ? "Generating..." : "Generate quiz"}
                        </Button>
                        <span className="text-xs text-muted-foreground">
                          Tip: Larger inputs produce richer questions.
                        </span>
                      </div>
                    </CardFooter>
                  </TabsContent>

                  {/* Upload documents */}
                  <TabsContent value="upload" className="mt-4">
                    <div className="space-y-3">
                      <Label htmlFor="files">Upload PDFs</Label>
                      <div className="border-2 border-dashed rounded-lg p-6 bg-white">
                        <Input
                          id="files"
                          type="file"
                          multiple
                          accept=".pdf"
                          onChange={(e) =>
                            setFiles(Array.from(e.target.files || []))
                          }
                        />
                        <p className="text-xs text-muted-foreground mt-2">
                          You can select multiple PDFs.
                        </p>
                        {!!files.length && (
                          <div className="mt-3 text-xs text-slate-700">
                            Selected: {files.map((f) => f.name).join(", ")}
                          </div>
                        )}
                      </div>
                    </div>
                    <CardFooter className="px-0 pt-4">
                      <div className="flex items-center gap-3">
                        <Button
                          onClick={handlePdfUpload}
                          disabled={loading || files.length === 0}
                        >
                          {loading ? "Generating..." : "Generate quiz"}
                        </Button>
                        <span className="text-xs text-muted-foreground">
                          PDFs are parsed and summarized before question
                          creation.
                        </span>
                      </div>
                    </CardFooter>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Settings */}
            <Card>
              <CardHeader>
                <div>
                  <h3 className="text-lg font-semibold">Settings</h3>
                  <p className="text-sm text-muted-foreground">
                    Adjust difficulty, count, and question types.
                  </p>
                </div>
              </CardHeader>
              <CardContent>
                <QuizSettings
                  quizSettings={quizSettings}
                  setQuizSettings={setQuizSettings}
                />
              </CardContent>
            </Card>
          </div>

          {/* Right: Sticky preview */}
          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-6 space-y-4">
              <Card className="overflow-hidden">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">Live preview</h3>
                      <p className="text-sm text-muted-foreground">
                        Review and interact before exporting.
                      </p>
                    </div>
                    {!!questions.length && (
                      <Badge variant="secondary">{questions.length} Qs</Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="flex items-center justify-center py-12">
                      <Spinner />
                    </div>
                  ) : questions.length > 0 && quiz ? (
                    <QuizPreview questions={questions} quiz={quiz} />
                  ) : (
                    <EmptyPreviewState />
                  )}
                </CardContent>
              </Card>

              {/* Optional: Actions */}
              {questions.length > 0 && quiz && (
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      exportQuizQuestions(questions, quiz);
                      toast.success("Quiz exported successfully!");
                    }}
                  >
                    Export Quiz
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      exportQuizMarkscheme(questions, quiz);
                      toast.success("Markscheme exported successfully!");
                    }}
                  >
                    Export Markscheme
                  </Button>

                  {user && (
                    <>
                      <Button
                        disabled={loading}
                        onClick={async () => {
                          setLoading(true);
                          try {
                            const id = await saveQuiz(quiz, questions);
                            if (!id) {
                              throw new Error("No quiz ID returned");
                            }
                            toast.success("🎯 Quiz started!");
                            router.push(`/quiz/${id}`);
                          } catch (err) {
                            toast.error("💔 Could not start quiz!");
                            console.error("Start quiz failed:", err);
                          } finally {
                            setLoading(false);
                          }
                        }}
                      >
                        {loading ? "Starting…" : "Start Quiz"}
                      </Button>

                      <Button
                        variant="outline"
                        disabled={loading}
                        onClick={async () => {
                          setLoading(true);
                          try {
                            await saveQuiz(quiz, questions);
                            toast.success("🎉 Quiz saved!");
                          } catch (err) {
                            toast.error("💩 Quiz save failed!");
                            console.error("Save failed:", err);
                          } finally {
                            setLoading(false);
                          }
                        }}
                      >
                        {loading ? "Saving…" : "Save Quiz"}
                      </Button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <Separator className="my-10" />
        <footer className="text-center text-sm text-muted-foreground py-8">
          © {new Date().getFullYear()} QuizSmith. Built for curious minds.
        </footer>
      </section>
    </div>
  );
}

/* ------------------------ Empty preview state ------------------------ */

function EmptyPreviewState() {
  return (
    <div className="py-12 text-center">
      <div className="mx-auto mb-3 h-12 w-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M3 3h7l5 5v13H3z" />
          <path d="M10 3v5h5" />
        </svg>
      </div>
      <h4 className="font-medium">No preview yet</h4>
      <p className="text-sm text-muted-foreground">
        Paste text or upload PDFs to generate a quiz preview.
      </p>
    </div>
  );
}
