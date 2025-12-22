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
import { Quiz, Question } from "@/lib/supabase/client"; // ✅ Use Supabase types

const TRUE_FALSE_OPTIONS = ["True", "False"] as const;

export default function QuizPreview({
  questions,
  quiz,
}: {
  questions: Question[];
  quiz: Quiz;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [responses, setResponses] = useState<Record<number, string>>({});

  const currentQuestion = questions[currentIndex];

  const handleChange = useCallback(
    (val: string) => {
      setResponses((prev) => ({ ...prev, [currentIndex]: val }));
    },
    [currentIndex]
  );

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

        return (
          <div
            key={opt}
            role="radio"
            aria-checked={selected}
            tabIndex={0}
            onClick={() => handleChange(opt)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleChange(opt);
              }
            }}
            className={clsx(
              "p-4 border rounded-lg cursor-pointer transition-all duration-200 text-left outline-none",
              {
                "bg-gray-100 border-gray-400 text-gray-900": selected,
                "border-gray-200 text-gray-700": !selected,
              }
            )}
          >
            {opt}
          </div>
        );
      })}
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <h3>{quiz.title}</h3>
        <p>{quiz.description}</p>
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

            return (
              <Button
                key={i}
                onClick={() => goTo(i)}
                variant="outline"
                size="sm"
                className={clsx({
                  "ring-2 ring-offset-2 ring-gray-300": isActive,
                })}
                aria-current={isActive ? "step" : undefined}
              >
                {i + 1}
              </Button>
            );
          })}

          <Button
            variant="outline"
            onClick={() => goTo(currentIndex + 1)}
            disabled={currentIndex === questions.length - 1}
          >Next
          </Button>
        </div>
      </CardFooter>
    </Card>
    );
}