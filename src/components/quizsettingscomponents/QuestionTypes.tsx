"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface QuizSettings {
  numQuestions: number;
  type?: {
    selectedTypes?: string[];
    distribution?: Record<string, number>;
  };
}

interface TypeProps {
  quizSettings: QuizSettings;
  setQuizSettings: React.Dispatch<React.SetStateAction<QuizSettings>>;
}

const QUESTION_TYPES = [
  "True/False",
  "Fill in the Blank",
  "Multiple Choice",
  "Short Answer",
  "Essay",
] as const;

const typeKeyMap: Record<(typeof QUESTION_TYPES)[number], string> = {
  "True/False": "truefalse",
  "Fill in the Blank": "fill",
  "Multiple Choice": "mcq",
  "Short Answer": "shortanswer",
  "Essay": "essay",
};

export default function Type({ quizSettings, setQuizSettings }: TypeProps) {
  const [customDistribution, setCustomDistribution] = useState(false);

  const selectedTypes = quizSettings.type?.selectedTypes ?? [];
  const distribution = quizSettings.type?.distribution ?? {};
  const totalQuestions = quizSettings.numQuestions;

  const distributionTotal = useMemo(
    () => Object.values(distribution).reduce((a, b) => a + (b || 0), 0),
    [distribution]
  );

  const updateSettings = (changes: Partial<QuizSettings["type"]>) => {
    setQuizSettings((prev) => ({
      ...prev,
      type: {
        selectedTypes: prev.type?.selectedTypes ?? [],
        distribution: prev.type?.distribution ?? {},
        ...changes,
      },
    }));
  };

  const toggleType = (key: string) => {
    const next = selectedTypes.includes(key)
      ? selectedTypes.filter((k) => k !== key)
      : [...selectedTypes, key];
    updateSettings({ selectedTypes: next });
  };

  const changeDist = (key: string, count: number) => {
    const prev = distribution[key] || 0;
    const nextTotal = distributionTotal - prev + count;

    if (nextTotal > totalQuestions) {
      toast("The total number of questions cannot exceed the maximum allowed.", {
        description: `You’ve allocated ${distributionTotal} of ${totalQuestions}.`,
        action: { label: "Got it", onClick: () => {} },
      });
      return;
    }

    updateSettings({ distribution: { ...distribution, [key]: count } });
  };

  const onToggleCustom = () => {
    const next = !customDistribution;
    setCustomDistribution(next);
    // clear distribution whenever toggling
    updateSettings({ distribution: {} });
  };

  return (
    <Card className="p-4 bg-card text-card-foreground space-y-3">
      <Label>Question Types</Label>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="customDistribution"
          checked={customDistribution}
          onCheckedChange={onToggleCustom}
        />
        <Label htmlFor="customDistribution">
          Customize number of each type
        </Label>
      </div>

      {customDistribution ? (
        <div className="grid grid-cols-1 gap-3">
          {QUESTION_TYPES.map((label) => {
            const key = typeKeyMap[label];
            return (
              <div key={key} className="flex items-center justify-between">
                <Label>{label}</Label>
                <Input
                  type="number"
                  min={0}
                  className="w-24"
                  value={distribution[key] ?? ""}
                  onChange={(e) =>
                    changeDist(key, Math.max(0, parseInt(e.target.value) || 0))
                  }
                />
              </div>
            );
          })}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {QUESTION_TYPES.map((label) => {
            const key = typeKeyMap[label];
            const isSelected = selectedTypes.includes(key);
            return (
              <Button
                variant={isSelected ? "default" : "secondary"}
                key={key}
                onClick={() => toggleType(key)}
              >
                {label}
              </Button>
            );
          })}
        </div>
      )}
    </Card>
  );
}
