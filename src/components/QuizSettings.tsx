import Difficulty from './quizsettingscomponents/Difficulty';
import NumQuestions from './quizsettingscomponents/NumQuestions';
import QuestionTypes from './quizsettingscomponents/QuestionTypes';

const QuizSettings = ({ quizSettings, setQuizSettings }: {
  quizSettings: any;
  setQuizSettings: React.Dispatch<React.SetStateAction<any>>;
}) => {
    return (
        <div>
            <h2 className="text-xl font-bold mb-4 text-gray-800">🛠️ Quiz Settings</h2>
            <div className="grid grid-cols-2 gap-4">
                <Difficulty quizSettings={quizSettings} setQuizSettings={setQuizSettings} />
                <NumQuestions quizSettings={quizSettings} setQuizSettings={setQuizSettings} />
                <QuestionTypes quizSettings={quizSettings} setQuizSettings={setQuizSettings}/>
            </div>
        </div>
  );
};

export default QuizSettings;
