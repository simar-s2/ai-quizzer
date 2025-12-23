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
import { Quiz, Question, AnswerInsert } from "@/lib/supabase/client";
import { exportQuizQuestions, exportQuizMarkscheme } from "@/lib/quizExport";
import { useQuizStore } from "@/store/useQuizStore";
import { finishQuiz } from "@/lib/supabase/finishQuiz";
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
  const { answers, addAnswer, clearAnswers } = useQuizStore();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [responses, setResponses] = useState<Record<number, string>>({});
  const [results, setResults] = useState<Record<number, Mark>>({});

  if (loading) return <p>Loading...</p>;
  if (!session || !user) {
    return (
      <div className="p-4">
        <p className="text-red-500">You must be logged in to take this quiz.</p>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const isMarked = results[currentIndex] !== undefined;
  const normalizedCorrect = normalize(currentQuestion.answer);

  const handleChange = useCallback(
    (val: string) => {
      setResponses((prev) => ({ ...prev, [currentIndex]: val }));

      const answerObj: AnswerInsert = {
        user_id: user?.id ?? null,
        quiz_id: quiz.id,
        question_id: currentQuestion.id,
        user_answer: val,
        is_correct: false,
      };
      addAnswer(answerObj);
    },
    [currentIndex, quiz, currentQuestion, addAnswer, user]
  );

  const handleMark = useCallback(() => {
    const userAnswer = normalize(responses[currentIndex]);
    let mark: Mark = "unknown";
    let correct = false;

    if (isAutoMarkable(currentQuestion)) {
      if (!userAnswer) {
        mark = "unknown";
      } else {
        correct = userAnswer === normalizedCorrect;
        mark = correct ? "correct" : "incorrect";
      }
    } else if (
      currentQuestion.type === "essay" ||
      currentQuestion.type === "shortanswer"
    ) {
      mark = "manual";
    }

    setResults((prev) => ({ ...prev, [currentIndex]: mark }));

    const answerObj: AnswerInsert = {
      user_id: user?.id ?? null,
      quiz_id: quiz.id,
      question_id: currentQuestion.id,
      user_answer: responses[currentIndex] ?? null,
      is_correct: correct,
    };
    addAnswer(answerObj);
  }, [
    currentIndex,
    currentQuestion,
    responses,
    normalizedCorrect,
    quiz,
    addAnswer,
    user,
  ]);

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

  const markAt = (i: number): Mark | undefined => results[i];
  const isCorrectAt = (i: number) => results[i] === "correct";
  const isIncorrectAt = (i: number) => results[i] === "incorrect";

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
        <h3>{quiz.title}</h3>
        <p>{quiz.description}</p>
        <p>{quiz.created_at ? new Date(quiz.created_at).toLocaleDateString() : ""}</p>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Question {currentIndex + 1} of {questions.length}
          </p>
          <Badge variant="secondary">{currentQuestion.type}</Badge>
        </div>

        <p>{currentQuestion.question_text}</p>

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
                    : "Unmarked"
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

      {currentIndex === questions.length - 1 && (
        <div className="p-6 pt-0">
          <Button
            variant="default"
            className="w-full"
            onClick={async () => {
              try {
                await finishQuiz(quiz.id, answers);
                clearAnswers();
                toast.success("Quiz submitted successfully!");
                router.push("/dashboard");
              } catch (error) {
                toast.error("Failed to submit quiz");
                console.error("Submit error:", error);
              }
            }}
          >
            Submit Quiz
          </Button>
        </div>
      )}

      <div className="p-6 pt-0 flex gap-2">
        <Button
          variant="outline"
          onClick={() => exportQuizQuestions(questions, quiz)}
        >
          Export Quiz
        </Button>
        <Button
          variant="outline"
          onClick={() => exportQuizMarkscheme(questions, quiz)}
        >
          Export Markscheme
        </Button>
      </div>
    </Card>
  );
}
