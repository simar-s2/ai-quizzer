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
import type { QuizQuestion } from "@/app/page"; // Adjust path to match where you moved QuizQuestion

/* ----------------------------- Helpers ----------------------------- */

// If you still want to use WithMeta separately elsewhere, you can keep it
type WithMeta = {
  explanation?: string;
  concepts?: string[];
};

// Define valid marking labels if you need them elsewhere
type Mark = "correct" | "incorrect" | "manual" | "unknown";

const TRUE_FALSE_OPTIONS = ["True", "False"] as const;

// Helper function to normalize strings
const normalize = (s?: string) => s?.trim().toLowerCase() ?? "";

// Use type narrowing based on the `type` field of `QuizQuestion`
const isAutoMarkable = (q: QuizQuestion) =>
  q.type === "mcq" || q.type === "truefalse" || q.type === "fill";


/* --------------------------------- Choice --------------------------------- */

type ChoiceProps = {
  text: string;
  selected: boolean;
  isMarked: boolean;
  isCorrectChoice: boolean;
  onClick: () => void;
};

function Choice({ text, selected, isMarked, isCorrectChoice, onClick }: ChoiceProps) {
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
          "bg-green-100 border-green-400 text-green-800": isMarked && isCorrectChoice,
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

/* --------------------------- Result panel (styled) ------------------------- */

function ResultPanel({
  mark,
  correctAnswer,
  explanation,
  concepts,
}: {
  mark: Mark;
  correctAnswer?: string;
  explanation?: string;
  concepts?: string[];
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
        <div className={clsx("w-6 h-6 rounded-full flex items-center justify-center mr-3 mt-0.5", iconBg)}>
          {/* Circle check (green) or x (red) inline SVGs */}
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

          {/* Prefer explanation if provided, else show the correct answer nicely */}
          {explanation ? (
            <p className="text-gray-700 text-sm">{explanation}</p>
          ) : correctAnswer ? (
            <div className="text-sm text-gray-700">
              {correctAnswer}
            </div>
          ) : null}

          {!!concepts?.length && (
            <div className="mt-3">
              <div className="text-xs font-medium text-gray-600 mb-1">Concepts covered:</div>
              <div className="flex flex-wrap gap-1">
                {concepts.map((c) => (
                  <span
                    key={c}
                    className="px-2 py-1 bg-[#E5F0EE] text-[#135E50] rounded-full text-xs"
                  >
                    {c}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------- Main component --------------------------- */

export default function QuizPreview({ questions }: { questions: QuizQuestion[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [responses, setResponses] = useState<Record<number, string>>({});
  const [results, setResults] = useState<Record<number, Mark>>({});

  const currentQuestion = questions[currentIndex];

  const isMarked = results[currentIndex] !== undefined;
  const normalizedCorrect = "answer" in currentQuestion ? normalize(currentQuestion.answer) : "";

  const handleChange = useCallback(
    (val: string) => {
      setResponses((prev) => ({ ...prev, [currentIndex]: val }));
    },
    [currentIndex]
  );

  const handleMark = useCallback(() => {
    const userAnswer = normalize(responses[currentIndex]);

    setResults((prev) => {
      let mark: Mark = "unknown";

      if (isAutoMarkable(currentQuestion)) {
        if (!userAnswer) {
          mark = "unknown";
        } else {
          mark = userAnswer === normalizedCorrect ? "correct" : "incorrect";
        }
      } else if (currentQuestion.type === "essay" || currentQuestion.type === "shortanswer") {
        mark = "manual";
      }

      return { ...prev, [currentIndex]: mark };
    });
  }, [currentIndex, currentQuestion, responses, normalizedCorrect]);

  const goTo = useCallback(
    (i: number) => {
      if (i < 0 || i >= questions.length) return;
      setCurrentIndex(i);
    },
    [questions.length]
  );

  const choiceOptions = useMemo(() => {
    if (currentQuestion.type === "mcq") return currentQuestion.options;
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
        <h3>📋 Multi-Format Quiz Preview</h3>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Question {currentIndex + 1} of {questions.length}
          </p>
          <Badge variant="secondary">{currentQuestion.type}</Badge>
        </div>

        <p>{currentQuestion.question}</p>

        {(currentQuestion.type === "mcq" || currentQuestion.type === "truefalse") && renderChoices}

        {currentQuestion.type === "fill" && (
          <Input
            placeholder="Type your answer here..."
            value={responses[currentIndex] || ""}
            onChange={(e) => handleChange(e.target.value)}
            className="h-14 px-4 py-3 text-base md:text-lg rounded-lg"
          />
        )}

        {(currentQuestion.type === "shortanswer" || currentQuestion.type === "essay") && (
          <Textarea
            rows={currentQuestion.type === "essay" ? 8 : 5}
            placeholder="Write your answer here..."
            value={responses[currentIndex] || ""}
            onChange={(e) => handleChange(e.target.value)}
            className="min-h-40 md:min-h-48 p-4 text-base md:text-lg rounded-lg"
          />
        )}

        {/* Styled result panel */}
        {results[currentIndex] && (
          <ResultPanel
            mark={results[currentIndex]!}
            correctAnswer={"answer" in currentQuestion ? currentQuestion.answer : undefined}
            // explanation={currentQuestion.explanation}
            // concepts={currentQuestion.concepts}
          />
        )}
      </CardContent>

      <CardFooter className="flex flex-wrap justify-between items-center pt-6 border-t gap-4">
        <div className="flex flex-wrap justify-center gap-2">
          <Button variant="outline" onClick={() => goTo(currentIndex - 1)} disabled={currentIndex === 0}>
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
                className={clsx(
                  "border",
                  {
                    "bg-green-100 border-green-400 text-green-800 hover:bg-green-100": isCorrect,
                    "bg-red-100 border-red-400 text-red-800 hover:bg-red-100": isIncorrect,
                    "ring-2 ring-offset-2 ring-gray-300": isActive && !isCorrect && !isIncorrect,
                    "ring-2 ring-offset-2 ring-green-300": isActive && isCorrect,
                    "ring-2 ring-offset-2 ring-red-300": isActive && isIncorrect,
                  }
                )}
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
    </Card>
  );
}
