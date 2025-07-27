import { useState } from "react";

interface typeProps {
  quizSettings: any;
  setQuizSettings: React.Dispatch<React.SetStateAction<any>>;
}

const QUESTION_TYPES = ["True/False", "Fill in the Blank", "Multiple Choice"];

const typeKeyMap: Record<string, string> = {
  "True/False": "truefalse",
  "Fill in the Blank": "fill",
  "Multiple Choice": "mcq",
};

const type = ({ quizSettings, setQuizSettings }: typeProps) => {
  const [customDistribution, setCustomDistribution] = useState(false);

  const handleTypeToggle = (type: string) => {
    const updatedTypes = quizSettings.type?.selectedTypes || [];
  
    const newTypes = updatedTypes.includes(typeKeyMap[type])
      ? updatedTypes.filter((t: string) => t !== typeKeyMap[type])
      : [...updatedTypes, typeKeyMap[type]];
  
    setQuizSettings({
      ...quizSettings,
      type: {
        ...quizSettings.type,
        selectedTypes: newTypes,
      },
    });
  };

  const handleDistributionChange = (type: string, value: string) => {
    const key = typeKeyMap[type];
    const count = Math.max(0, parseInt(value) || 0);
  
    const totalQuestions = quizSettings.numQuestions;
    const newDistributionTotal = Object.values(quizSettings.type?.distribution as 
      Record<string, number>).reduce((a, b) => a + b, 0) - 
      (quizSettings.type?.distribution as Record<string, number>)[key] + count;  
    if (newDistributionTotal > totalQuestions) {
      alert("The total number of questions cannot exceed the maximum allowed.");
      return;
    }
  
    setQuizSettings({
      ...quizSettings,
      type: {
        ...quizSettings.type,
        distribution: {
          ...quizSettings.type?.distribution,
          [key]: count,
        },
      },
    });
  };

  return (
    <div className="bg-gray-100 p-4 rounded-2xl shadow mb-4">
      <label className="block font-semibold mb-2 text-gray-700">Question Types</label>

      {/* Toggle for custom distribution */}
      <div className="flex items-center mb-4">
        <input
          id="customDistribution"
          type="checkbox"
          checked={customDistribution}
          onChange={() => setCustomDistribution(!customDistribution)}
          className="mr-2"
        />
        <label htmlFor="customDistribution" className="text-gray-700">
          Customize number of each type
        </label>
      </div>

      {/* If custom: show number inputs */}
      {customDistribution ? (
        <div className="grid grid-cols-1 gap-3">
          {QUESTION_TYPES.map((type) => (
            <div key={type} className="flex items-center justify-between">
              <label className="text-gray-700">{type}</label>
              <input
                type="number"
                min={0}
                className="w-20 rounded-lg px-2 py-1 border border-gray-300 focus:outline-none focus:ring focus:border-blue-300"
                value={quizSettings.type?.distribution?.[typeKeyMap[type]] || ""}
                onChange={(e) => handleDistributionChange(type, e.target.value)}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-wrap gap-3">
          {QUESTION_TYPES.map((type) => {
            const isSelected = quizSettings.type?.selectedTypes?.includes(typeKeyMap[type]);
            return (
              <button
                key={type}
                onClick={() => handleTypeToggle(type)}
                className={`px-4 py-2 rounded-xl border ${
                  isSelected
                    ? "bg-blue-500 text-white border-blue-600"
                    : "bg-white text-gray-700 border-gray-300"
                }`}
              >
                {type}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default type;
