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
      <Card className="p-4">
        <Label htmlFor="topic" className="block font-semibold">
          Topic
        </Label>
        <Input type="email" placeholder="Topic"
         onChange={(e) => handleChange(e.target.value)} 
         maxLength={50}/>
      </Card>
    );
  };
  
  export default Topic;
  