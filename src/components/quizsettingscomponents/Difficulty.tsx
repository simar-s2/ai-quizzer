import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { QuizSettingsType } from "@/types/quiz-settings";

const Difficulty = ({
    quizSettings,
    setQuizSettings,
  }: {
    quizSettings: QuizSettingsType;
    setQuizSettings: React.Dispatch<React.SetStateAction<QuizSettingsType>>;
  }) => {
    const handleChange = (value: string) => {
      setQuizSettings({ ...quizSettings, difficulty: value });
    };
  
    return (
      <Card className="p-4 bg-card text-card-foreground space-y-3">
        <Label htmlFor="difficulty" className="block font-semibold">
          Difficulty
        </Label>
        <Select 
          name="difficulty"
          value={quizSettings.difficulty}
          onValueChange={handleChange}
          >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select a difficulty" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="easy">Easy</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="hard">Hard</SelectItem>
              <SelectItem value="expert">Expert</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </Card>
    );
  };
  
  export default Difficulty;
  