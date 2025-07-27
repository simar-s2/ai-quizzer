const Difficulty = ({
    quizSettings,
    setQuizSettings,
  }: {
    quizSettings: any;
    setQuizSettings: React.Dispatch<React.SetStateAction<any>>;
  }) => {
    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      setQuizSettings({ ...quizSettings, difficulty: e.target.value });
    };
  
    return (
      <div className="w-1/2">
        <label htmlFor="difficulty" className="text-sm font-medium text-gray-700 dark:text-gray-200">
          Difficulty
        </label>
        <select
          id="difficulty"
          name="difficulty"
          className="block w-full p-2.5 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-blue-500 focus:border-blue-500"
          value={quizSettings.difficulty}
          onChange={handleChange}
        >
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>
      </div>
    );
  };
  
  export default Difficulty;
  