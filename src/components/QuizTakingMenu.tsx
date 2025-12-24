"use client";

import { useCallback, useMemo, useState } from "react";
import {
  Card,
  CardHeader,
  CardFooter,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "./ui/badge";
import clsx from "clsx";
import { Quiz, Question } from "@/lib/supabase/client";
import { exportQuizQuestions, exportQuizMarkscheme } from "@/lib/quizExport";
import { useAuth } from "@/components/AuthProvider";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

type Mark = "correct" | "incorrect" | "manual" | "unknown";

const TRUE_FALSE_OPTIONS = ["True", "False"] as const;

const normalize = (s?: string | null) => s?.trim().toLowerCase() ?? "";

const isAutoMarkable = (q: Question) =>
  q.type === "mcq" || q.type === "truefalse" || q.type === "fill";

type ChoiceProps = {
  text: string;
  selected: boolean;
  isMarked: boolean;
  isCorrectChoice: boolean;
  onClick: () => void;
};

function Choice({
  text,
  selected,
  isMarked,
  isCorrectChoice,
  onClick,
}: ChoiceProps) {
  const incorrect = isMarked && selected && !isCorrectChoice;

  return (
    <div
      role="radio"
      aria-checked={selected}
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
      className={clsx(
        "p-4 border rounded-lg cursor-pointer transition-all duration-200 text-left outline-none",
        {
          "bg-green-100 border-green-400 text-green-800":
            isMarked && isCorrectChoice,
          "bg-red-100 border-red-400 text-red-800": incorrect,
          "bg-gray-100 border-gray-400 text-gray-900": !isMarked && selected,
          "border-gray-200 text-gray-700": !isMarked && !selected,
        }
      )}
    >
      {text}
    </div>
  );
}

function ResultPanel({
  mark,
  correctAnswer,
  explanation,
}: {
  mark: Mark;
  correctAnswer?: string | null;
  explanation?: string | null;
}) {
  const isCorrect = mark === "correct";
  const isIncorrect = mark === "incorrect";
  const isManual = mark === "manual";

  const iconBg = isCorrect
    ? "bg-green-100 text-green-700"
    : isIncorrect
    ? "bg-red-100 text-red-700"
    : isManual
    ? "bg-yellow-100 text-yellow-700"
    : "bg-gray-100 text-gray-700";

  const title = isCorrect
    ? "Correct! 🎉"
    : isIncorrect
    ? "Not quite."
    : isManual
    ? "Manual review needed."
    : "Cannot mark.";

  return (
    <div className="mt-6 p-4 bg-gray-50 rounded-lg">
      <div className="flex items-start">
        <div
          className={clsx(
            "w-6 h-6 rounded-full flex items-center justify-center mr-3 mt-0.5",
            iconBg
          )}
        >
          {isCorrect ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21.801 10A10 10 0 1 1 17 3.335"></path>
              <path d="m9 11 3 3L22 4"></path>
            </svg>
          ) : isIncorrect ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10"></circle>
              <path d="M15 9 9 15"></path>
              <path d="m9 9 6 6"></path>
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10"></circle>
              <path d="M12 8v4"></path>
              <path d="M12 16h.01"></path>
            </svg>
          )}
        </div>

        <div className="flex-1">
          <div className="font-medium mb-2">{title}</div>
          <p className="text-gray-700 text-sm">
            Answer: {correctAnswer ?? "N/A"}. {explanation ?? ""}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function QuizTakingMenu({
  questions,
  quiz,
}: {
  questions: Question[];
  quiz: Quiz;
}) {
  const router = useRouter();
  const { session, user, loading } = useAuth();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [responses, setResponses] = useState<Record<number, string>>({});
  const [results, setResults] = useState<Record<number, Mark>>({});
  const [submitting, setSubmitting] = useState(false);
  const [startTime] = useState(Date.now());

  const currentQuestion = questions[currentIndex];
  const isMarked = results[currentIndex] !== undefined;
  const normalizedCorrect = normalize(currentQuestion.answer);

  const handleChange = useCallback(
    (val: string) => {
      setResponses((prev) => ({ ...prev, [currentIndex]: val }));
    },
    [currentIndex]
  );

  const handleMark = useCallback(() => {
    const userAnswer = normalize(responses[currentIndex]);
    let mark: Mark = "unknown";

    if (isAutoMarkable(currentQuestion)) {
      if (!userAnswer) {
        mark = "unknown";
      } else {
        const correct = userAnswer === normalizedCorrect;
        mark = correct ? "correct" : "incorrect";
      }
    } else if (
      currentQuestion.type === "essay" ||
      currentQuestion.type === "shortanswer"
    ) {
      mark = "manual";
    }

    setResults((prev) => ({ ...prev, [currentIndex]: mark }));
  }, [currentIndex, currentQuestion, responses, normalizedCorrect]);

  const handleSubmitQuiz = async () => {
    if (!confirm("Are you sure you want to submit your quiz? This action cannot be undone.")) {
      return;
    }

    setSubmitting(true);

    try {
      // Calculate time taken in seconds
      const timeTaken = Math.floor((Date.now() - startTime) / 1000);

      // Prepare answers for submission
      const answers = questions.map((q, index) => ({
        question_id: q.id,
        user_answer: responses[index] || "",
      }));

      const response = await fetch("/api/mark-quiz", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          quiz_id: quiz.id,
          answers,
          time_taken: timeTaken,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit quiz");
      }

      toast.success(`Quiz submitted! You scored ${data.score.toFixed(1)}%`, {
        description: data.overall_feedback,
        duration: 5000,
      });

      // Redirect to results page or dashboard
      router.push(`/quiz/${quiz.id}/results/${data.attempt_id}`);
    } catch (error) {
      console.error("Submit error:", error);
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
      toast.error("Failed to submit quiz", {
        description: errorMessage,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const goTo = useCallback(
    (i: number) => {
      if (i < 0 || i >= questions.length) return;
      setCurrentIndex(i);
    },
    [questions.length]
  );

  const choiceOptions = useMemo(() => {
    const options = currentQuestion.options as string[] | null;
    if (currentQuestion.type === "mcq") return options ?? [];
    if (currentQuestion.type === "truefalse") return [...TRUE_FALSE_OPTIONS];
    return null;
  }, [currentQuestion]);

  const markAt = (i: number): Mark | undefined => results[i];
  const isCorrectAt = (i: number) => results[i] === "correct";
  const isIncorrectAt = (i: number) => results[i] === "incorrect";

  if (loading) return <p>Loading...</p>;
  if (!session || !user) {
    return (
      <div className="p-4">
        <p className="text-red-500">You must be logged in to take this quiz.</p>
      </div>
    );
  }

  const renderChoices = choiceOptions && (
    <div className="space-y-3" role="radiogroup" aria-label="Choices">
      {choiceOptions.map((opt) => {
        const selected = responses[currentIndex] === opt;
        const isCorrectChoice = normalize(opt) === normalizedCorrect;

        return (
          <Choice
            key={opt}
            text={opt}
            selected={!!selected}
            isMarked={isMarked}
            isCorrectChoice={isCorrectChoice}
            onClick={() => handleChange(opt)}
          />
        );
      })}
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap gap-2">
          {quiz.tags?.map((tag, index) => (
            <Badge key={index} variant={"secondary"}>
              {tag}
            </Badge>
          ))}
        </div>
        <h3 className="text-2xl font-bold">{quiz.title}</h3>
        <p className="text-muted-foreground">{quiz.description}</p>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Question {currentIndex + 1} of {questions.length}
          </p>
          <Badge variant="secondary">{currentQuestion.type}</Badge>
        </div>

        <p className="text-lg font-medium">{currentQuestion.question_text}</p>

        {(currentQuestion.type === "mcq" ||
          currentQuestion.type === "truefalse") &&
          renderChoices}

        {currentQuestion.type === "fill" && (
          <Input
            placeholder="Type your answer here..."
            value={responses[currentIndex] || ""}
            onChange={(e) => handleChange(e.target.value)}
            className="h-14 px-4 py-3 text-base md:text-lg rounded-lg"
          />
        )}

        {(currentQuestion.type === "shortanswer" ||
          currentQuestion.type === "essay") && (
          <Textarea
            rows={currentQuestion.type === "essay" ? 8 : 5}
            placeholder="Write your answer here..."
            value={responses[currentIndex] || ""}
            onChange={(e) => handleChange(e.target.value)}
            className="min-h-40 md:min-h-48 p-4 text-base md:text-lg rounded-lg"
          />
        )}

        {results[currentIndex] && (
          <ResultPanel
            mark={results[currentIndex]!}
            correctAnswer={currentQuestion.answer}
            explanation={currentQuestion.explanation}
          />
        )}
      </CardContent>

      <CardFooter className="flex flex-wrap justify-between items-center pt-6 border-t gap-4">
        <div className="flex flex-wrap justify-center gap-2">
          <Button
            variant="outline"
            onClick={() => goTo(currentIndex - 1)}
            disabled={currentIndex === 0}
          >
            Previous
          </Button>

          {questions.map((_, i) => {
            const isActive = currentIndex === i;
            const isCorrect = isCorrectAt(i);
            const isIncorrect = isIncorrectAt(i);
            const hasAnswer = responses[i] !== undefined && responses[i] !== "";

            return (
              <Button
                key={i}
                onClick={() => goTo(i)}
                variant="outline"
                size="sm"
                className={clsx("border", {
                  "bg-green-100 border-green-400 text-green-800 hover:bg-green-100":
                    isCorrect,
                  "bg-red-100 border-red-400 text-red-800 hover:bg-red-100":
                    isIncorrect,
                  "bg-blue-50 border-blue-300": hasAnswer && !isCorrect && !isIncorrect,
                  "ring-2 ring-offset-2 ring-gray-300":
                    isActive && !isCorrect && !isIncorrect,
                  "ring-2 ring-offset-2 ring-green-300": isActive && isCorrect,
                  "ring-2 ring-offset-2 ring-red-300": isActive && isIncorrect,
                })}
                aria-current={isActive ? "step" : undefined}
                title={
                  markAt(i) === "correct"
                    ? "Correct"
                    : markAt(i) === "incorrect"
                    ? "Incorrect"
                    : markAt(i) === "manual"
                    ? "Manual review"
                    : markAt(i) === "unknown"
                    ? "Cannot mark"
                    : hasAnswer
                    ? "Answered"
                    : "Not answered"
                }
              >
                {i + 1}
              </Button>
            );
          })}

          <Button
            variant="outline"
            onClick={() => goTo(currentIndex + 1)}
            disabled={currentIndex === questions.length - 1}
          >
            Next
          </Button>
        </div>

        <Button variant="outline" onClick={handleMark}>
          🧠 Check Answer
        </Button>
      </CardFooter>

      <div className="p-6 pt-0 space-y-3">
        <Button
          variant="default"
          className="w-full"
          size="lg"
          onClick={handleSubmitQuiz}
          disabled={submitting}
        >
          {submitting ? "Submitting..." : "Submit Quiz for Grading"}
        </Button>

        <div className="flex gap-2">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => exportQuizQuestions(questions, quiz)}
          >
            Export Quiz
          </Button>
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => exportQuizMarkscheme(questions, quiz)}
          >
            Export Markscheme
          </Button>
        </div>
      </div>
    </Card>
  );
}
