import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const Topic = ({
    quizSettings,
    setQuizSettings,
  }: {
    quizSettings: any;
    setQuizSettings: React.Dispatch<React.SetStateAction<any>>;
  }) => {
    const handleChange = (value: string) => {
      if (!quizSettings || !setQuizSettings) {
        console.error("Error: quizSettings or setQuizSettings is null/undefined!");
        return;
      }
      setQuizSettings({ ...quizSettings, topic: value });
    };
  
    return (
      <Card className="p-4 bg-card text-card-foreground space-y-3">
        <Input
          type="text"
          placeholder="E.g. Biology, History, Python basics..."
          className="w-full rounded-md"
          maxLength={50}
        />
      </Card>
    );
  };
  
  export default Topic;
  