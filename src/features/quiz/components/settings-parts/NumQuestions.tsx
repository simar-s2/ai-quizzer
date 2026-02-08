import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { QuizSettingsType } from "@/types/quiz-settings";

const NumQuestions = ({
  quizSettings,
  setQuizSettings,
}: {
  quizSettings: QuizSettingsType;
  setQuizSettings: React.Dispatch<React.SetStateAction<QuizSettingsType>>;
}) => {
  const handleNumQuestionsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const numQuestions = Math.max(1, parseInt(value) || 1);
    const totalDistribution: number = Object.values(quizSettings.type.distribution).reduce((a: number, b: number) => a + b, 0);
        if (numQuestions < totalDistribution) {
          toast("Question count too low for selected distribution.", {
            description: `You’ve allocated ${totalDistribution} questions across types. Please increase the total to match or exceed the distribution.`,
            action: { label: "Got it", onClick: () => {} },
          });
      return;
    }

    setQuizSettings({ ...quizSettings, numQuestions });
  };

  return (
    <Card className="p-4 bg-card text-card-foreground space-y-3">
      <Label htmlFor="numQuestions" className="block font-semibold">
        Number of Questions
      </Label>
      <Input
        type="number"
        id="numQuestions"
        name="numQuestions"
        min={1}
        max={50}
        className="w-24 rounded-lg"
        value={quizSettings.numQuestions}
        onChange={handleNumQuestionsChange}
      />
    </Card>
  );
};

export default NumQuestions;
