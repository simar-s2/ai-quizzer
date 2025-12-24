import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { QuizSettingsType } from "@/types/quiz-settings";

const Topic = ({
    quizSettings,
    setQuizSettings,
  }: {
    quizSettings: QuizSettingsType;
    setQuizSettings: React.Dispatch<React.SetStateAction<QuizSettingsType>>;
  }) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!quizSettings || !setQuizSettings) {
        console.error("Error: quizSettings or setQuizSettings is null/undefined!");
        return;
      }
      setQuizSettings({ ...quizSettings, topic: e.target.value });
    };
  
    return (
      <Card className="p-4 bg-card text-card-foreground space-y-3">
        <Input
          type="text"
          placeholder="E.g. Biology, History, Python basics..."
          className="w-full rounded-md"
          maxLength={50}
          value={quizSettings.topic || ""}
          onChange={handleChange}
        />
      </Card>
    );
  };
  
  export default Topic;
  