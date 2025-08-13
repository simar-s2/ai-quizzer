import Difficulty from "./quizsettingscomponents/Difficulty";
import NumQuestions from "./quizsettingscomponents/NumQuestions";
import QuestionTypes from "./quizsettingscomponents/QuestionTypes";
import Topic from "./quizsettingscomponents/Topic";
import { Separator } from "@/components/ui/separator";

const QuizSettings = ({
  quizSettings,
  setQuizSettings,
}: {
  quizSettings: any;
  setQuizSettings: React.Dispatch<React.SetStateAction<any>>;
}) => {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3>🧠 Quiz Configuration</h3>
        <p className="text-sm text-muted-foreground">
          Choose difficulty, question count, and types
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Difficulty
          quizSettings={quizSettings}
          setQuizSettings={setQuizSettings}
        />
        <NumQuestions
          quizSettings={quizSettings}
          setQuizSettings={setQuizSettings}
        />
        <QuestionTypes
          quizSettings={quizSettings}
          setQuizSettings={setQuizSettings}
        />
      </div>

      <Separator />

      <div className="space-y-2">
        <h3>📚 Content Metadata</h3>
        <p className="text-sm text-muted-foreground">
          Define quiz topic or subject area
        </p>
      </div>

      <Topic quizSettings={quizSettings} setQuizSettings={setQuizSettings} />
    </div>
  );
};

export default QuizSettings;
