import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface typeProps {
  quizSettings: any;
  setQuizSettings: React.Dispatch<React.SetStateAction<any>>;
}

const QUESTION_TYPES = ["True/False", "Fill in the Blank", "Multiple Choice", "Short Answer", "Essay"];

const typeKeyMap: Record<string, string> = {
  "True/False": "truefalse",
  "Fill in the Blank": "fill",
  "Multiple Choice": "mcq",
  "Short Answer": "shortanswer",
  "Essay": "essay",
};

const Type = ({ quizSettings, setQuizSettings }: typeProps) => {
  const [customDistribution, setCustomDistribution] = useState(false);

  const handleTypeToggle = (type: string) => {
    const updatedTypes = quizSettings.type?.selectedTypes || [];

    const newTypes = updatedTypes.includes(typeKeyMap[type])
      ? updatedTypes.filter((t: string) => t !== typeKeyMap[type])
      : [...updatedTypes, typeKeyMap[type]];

    setQuizSettings({
      ...quizSettings,
      type: {
        ...quizSettings.type,
        selectedTypes: newTypes,
      },
    });
  };

  const handleDistributionChange = (type: string, value: string) => {
    const key = typeKeyMap[type];
    const count = Math.max(0, parseInt(value) || 0);

    const totalQuestions = quizSettings.numQuestions;
    const newDistributionTotal = Object.values(quizSettings.type?.distribution as Record<string, number>)
      .reduce((a, b) => a + b, 0)
      - (quizSettings.type?.distribution as Record<string, number>)[key]
      + count;

    if (newDistributionTotal > totalQuestions) {
      alert("The total number of questions cannot exceed the maximum allowed.");
      return;
    }

    setQuizSettings({
      ...quizSettings,
      type: {
        ...quizSettings.type,
        distribution: {
          ...quizSettings.type?.distribution,
          [key]: count,
        },
      },
    });
  };

  return (
    <Card className="p-4 bg-card text-card-foreground space-y-3">
      <Label>Question Types</Label>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="customDistribution"
          checked={customDistribution}
          onCheckedChange={() => setCustomDistribution(!customDistribution)}
        />
        <Label htmlFor="customDistribution">
          Customize number of each type
        </Label>
      </div>

      {customDistribution ? (
        <div className="grid grid-cols-1 gap-3">
          {QUESTION_TYPES.map((type) => (
            <div key={type} className="flex items-center justify-between">
              <Label>{type}</Label>
              <Input
                type="number"
                min={0}
                className="w-24"
                value={quizSettings.type?.distribution?.[typeKeyMap[type]] || ""}
                onChange={(e) => handleDistributionChange(type, e.target.value)}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {QUESTION_TYPES.map((type) => {
            const isSelected = quizSettings.type?.selectedTypes?.includes(typeKeyMap[type]);
            return (
              <Button
                variant={isSelected ? "default" : "secondary"}
                key={type}
                onClick={() => handleTypeToggle(type)}
              >
                {type}
              </Button>
            );
          })}
        </div>
      )}
    </Card>
  );
};

export default Type;

