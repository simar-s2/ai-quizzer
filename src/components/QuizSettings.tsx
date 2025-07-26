import Difficulty from './quizsettingscomponents/Difficulty';

const QuizSettings = ({ quizSettings, setQuizSettings }: {
  quizSettings: any;
  setQuizSettings: React.Dispatch<React.SetStateAction<any>>;
}) => {
  return (
    <div>
      <Difficulty quizSettings={quizSettings} setQuizSettings={setQuizSettings} />
    </div>
  );
};

export default QuizSettings;
