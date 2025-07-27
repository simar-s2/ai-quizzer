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
      <div className="bg-gray-100 p-4 rounded-2xl shadow mb-4">
        <label htmlFor="difficulty" className="block font-semibold mb-2 text-gray-700">
          Difficulty
        </label>
        <select
          id="difficulty"
          name="difficulty"
          className="w-full rounded-lg px-2 py-2 border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring focus:border-blue-300"
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
  