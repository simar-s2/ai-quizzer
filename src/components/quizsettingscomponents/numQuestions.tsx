const NumQuestions = ({
  quizSettings,
  setQuizSettings,
}: {
  quizSettings: any;
  setQuizSettings: React.Dispatch<React.SetStateAction<any>>;
}) => {
  const handleNumQuestionsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const numQuestions = Math.max(1, parseInt(value) || 1);
    const totalDistribution: number = Object.values(quizSettings.type?.distribution).reduce((a: number, b: unknown) => {
      if (typeof b === 'number') {
        return a + b;
      } else {
        throw new Error('Expected a number');
      }
    }, 0) as number;
        if (numQuestions < totalDistribution) {
      alert("The total number of questions cannot be less than the sum of the distribution.");
      return;
    }

    setQuizSettings({ ...quizSettings, numQuestions });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    setQuizSettings({ ...quizSettings, numQuestions: isNaN(value) ? 0 : value });
  };

  return (
    <div className="bg-gray-100 p-4 rounded-2xl shadow mb-4">
      <label htmlFor="numQuestions" className="block font-semibold mb-2 text-gray-700">
        Number of Questions
      </label>
      <input
        type="number"
        id="numQuestions"
        name="numQuestions"
        min={1}
        max={50}
        className="w-24 rounded-lg px-2 py-1 border border-gray-300 focus:outline-none focus:ring focus:border-blue-300 bg-white text-gray-900"
        value={quizSettings.numQuestions}
        onChange={handleNumQuestionsChange}
      />
    </div>
  );
};

export default NumQuestions;