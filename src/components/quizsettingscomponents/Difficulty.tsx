import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const Difficulty = ({
    quizSettings,
    setQuizSettings,
  }: {
    quizSettings: any;
    setQuizSettings: React.Dispatch<React.SetStateAction<any>>;
  }) => {
    const handleChange = (value: string) => {
      setQuizSettings({ ...quizSettings, difficulty: value });
    };
  
    return (
      <Card className="p-4">
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
  