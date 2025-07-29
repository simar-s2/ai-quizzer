import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";

const NumQuestions = ({
  quizSettings,
  setQuizSettings,
}: {
  quizSettings: any;
  setQuizSettings: React.Dispatch<React.SetStateAction<any>>;
}) => {
  const handleNumQuestionsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const numQuestions = Math.max(1, parseInt(value) || 1);
    const totalDistribution: number = Object.values(quizSettings.type?.distribution).reduce((a: number, b: unknown) => {
      if (typeof b === 'number') {
        return a + b;
      } else {
        throw new Error('Expected a number');
      }
    }, 0) as number;
        if (numQuestions < totalDistribution) {
      alert("The total number of questions cannot be less than the sum of the distribution.");
      return;
    }

    setQuizSettings({ ...quizSettings, numQuestions });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    setQuizSettings({ ...quizSettings, numQuestions: isNaN(value) ? 0 : value });
  };

  return (
    <Card className="p-4">
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