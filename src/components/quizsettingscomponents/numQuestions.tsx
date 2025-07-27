const NumQuestions = ({
  quizSettings,
  setQuizSettings,
}: {
  quizSettings: any;
  setQuizSettings: React.Dispatch<React.SetStateAction<any>>;
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    setQuizSettings({ ...quizSettings, numQuestions: isNaN(value) ? 0 : value });
  };

  return (
    <div className="w-1/2">
      <label htmlFor="numQuestions" className="text-sm font-medium text-gray-700 dark:text-gray-200">
        Number of Questions
      </label>
      <input
        type="number"
        id="numQuestions"
        name="numQuestions"
        min={1}
        max={50}
        className="block w-full p-2.5 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-blue-500 focus:border-blue-500 "
        value={quizSettings.numQuestions}
        onChange={handleChange}
      />
    </div>
  );
};

export default NumQuestions;
