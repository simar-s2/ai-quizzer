"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Upload, Zap, Loader2 } from "lucide-react";
import QuizSettings from "@/features/quiz/components/QuizSettings";
import QuizPreview from "@/features/quiz/components/QuizPreview";
import type { QuizSettingsType } from "@/types/quiz-settings";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import { saveQuiz } from "@/features/quiz/services/saveQuiz";
import {
  exportQuizQuestions,
  exportQuizMarkscheme,
} from "@/features/quiz/util/quizExport";
import { useQuizStore } from "@/features/quiz/hooks/useQuizStore";
import { useGenerateQuizStream } from "@/features/quiz/hooks/useGenerateQuizStream";

export function QuizGeneratorSection() {
  const router = useRouter();
  const { user } = useAuth();

  // ── Stream state from store (replaces local questions/quiz/loading) ──
  const { streamedQuestions, streamedQuiz, isStreaming } = useQuizStore();
  const { generate } = useGenerateQuizStream();

  // ── Local UI state (unrelated to generation) ──
  const [saving, setSaving] = useState(false);
  const [savedQuizId, setSavedQuizId] = useState<string | null>(null);
  const [rawText, setRawText] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [quizSettings, setQuizSettings] = useState<QuizSettingsType>({
    difficulty: "medium",
    numQuestions: 5,
    topic: "",
    type: {
      selectedTypes: [],
      distribution: { mcq: 0, fill: 0, truefalse: 0, shortanswer: 0, essay: 0 },
    },
  });

  const handleTextSubmit = async () => {
    if (!rawText.trim()) return;
    setSavedQuizId(null);
    await generate({ text: rawText, settings: quizSettings }, false);
  };

  const handlePdfUpload = async () => {
    if (!files.length) return;
    setSavedQuizId(null);
    const formData = new FormData();
    files.forEach((f) => formData.append("files", f));
    formData.append("settings", JSON.stringify(quizSettings));
    await generate(formData, true);
  };

  const handleSaveQuiz = async (): Promise<string | null> => {
    // Fixed: was referencing old local `quiz` and `questions`
    if (!streamedQuiz || !streamedQuestions.length) {
      toast.error("No quiz to save");
      return null;
    }

    if (savedQuizId) {
      return savedQuizId;
    }

    setSaving(true);
    try {
      const id = await saveQuiz(streamedQuiz, streamedQuestions);
      if (!id) {
        throw new Error("Failed to get quiz ID");
      }
      setSavedQuizId(id);
      return id;
    } catch (error) {
      console.error("Save quiz error:", error);
      toast.error("Failed to save quiz");
      return null;
    } finally {
      setSaving(false);
    }
  };

  const handleStartQuiz = async () => {
    const id = await handleSaveQuiz();
    if (id) {
      toast.success("Quiz started!");
      router.push(`/quiz/${id}`);
    }
  };

  const handleSaveForLater = async () => {
    const id = await handleSaveQuiz();
    if (id) {
      toast.success("Quiz saved! Find it in your dashboard.");
    }
  };

  // Derived: quiz is fully done when streaming stops and we have questions
  const quizReady = !isStreaming && streamedQuestions.length > 0 && !!streamedQuiz;
  // Show preview during streaming too (live update) or when done
  const showPreview = (isStreaming || quizReady) && streamedQuestions.length > 0 && !!streamedQuiz;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
                    disabled={isStreaming || !rawText.trim()}
                    size="lg"
                    className="w-full"
                  >
                    {isStreaming ? (
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
                        <p className="text-sm text-muted-foreground">
                          Drag and drop or click to browse
                        </p>
                      </div>
                      <Input
                        id="files"
                        type="file"
                        multiple
                        accept=".pdf"
                        onChange={(e) =>
                          setFiles(Array.from(e.target.files || []))
                        }
                        className="max-w-xs"
                      />
                    </div>
                    {!!files.length && (
                      <div className="mt-4 p-3 bg-background rounded-lg border">
                        <p className="text-sm font-medium mb-2">
                          Selected ({files.length}):
                        </p>
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
                  <Button
                    onClick={handlePdfUpload}
                    disabled={isStreaming || !files.length}
                    size="lg"
                    className="w-full"
                  >
                    {isStreaming ? (
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
              <QuizSettings
                quizSettings={quizSettings}
                setQuizSettings={setQuizSettings}
              />
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-24 space-y-4">
            <Card className="bg-card/50 border-border/50">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold">Preview</h3>
                  {/* Badge updates live as questions stream in */}
                  {streamedQuestions.length > 0 && (
                    <Badge variant="secondary" className="flex items-center gap-1.5">
                      {isStreaming && (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      )}
                      {streamedQuestions.length} Question{streamedQuestions.length !== 1 ? "s" : ""}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {showPreview ? (
                  <QuizPreview questions={streamedQuestions} quiz={streamedQuiz} />
                ) : isStreaming ? (
                  // Still waiting for the first question to appear
                  <div className="flex flex-col items-center justify-center py-16">
                    <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                    <p className="text-sm text-muted-foreground">
                      Generating your quiz...
                    </p>
                  </div>
                ) : (
                  // Idle empty state
                  <div className="py-16 text-center">
                    <div className="h-16 w-16 rounded-xl bg-muted flex items-center justify-center mx-auto mb-4">
                      <FileText className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <p className="font-medium mb-1">No quiz yet</p>
                    <p className="text-sm text-muted-foreground">
                      Enter content and generate to preview
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Action buttons — only shown when quiz is fully done, not mid-stream */}
            {quizReady && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      exportQuizQuestions(streamedQuestions, streamedQuiz);
                      toast.success("Exported!");
                    }}
                  >
                    Export Quiz
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      exportQuizMarkscheme(streamedQuestions, streamedQuiz);
                      toast.success("Exported!");
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
                      disabled={saving}
                      onClick={handleStartQuiz}
                    >
                      {saving ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : savedQuizId ? (
                        "Start Quiz"
                      ) : (
                        "Save & Start Quiz"
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full bg-transparent"
                      disabled={saving}
                      onClick={handleSaveForLater}
                    >
                      {saving ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : savedQuizId ? (
                        "Saved ✓"
                      ) : (
                        "Save for Later"
                      )}
                    </Button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}