// components/QuizPreview.tsx
export default function QuizPreview({
    questions,
  }: {
    questions: { type: string; question: string; options?: string[]; answer?: string }[];
  }) {
    if (!questions || questions.length === 0) {
      return <p className="text-gray-800">No quiz generated yet.</p>;
    }
  
    return (
      <div className="space-y-6">
        <h2 className="text-xl font-semibold mb-2 text-gray-800">📋 Generated Quiz</h2>
  
        {questions.map((q, idx) => (
          <div key={idx} className="border p-4 rounded-lg bg-gray-50">
            <p className="font-medium mb-2 text-gray-800">{idx + 1}. {q.question}</p>
  
            {q.type === "mcq" && q.options && (
              <ul className="list-disc pl-6 space-y-1 text-gray-800">
                {q.options.map((opt, i) => (
                  <li key={i}>{opt}</li>
                ))}
              </ul>
            )}
  
            {q.type === "fill" && (
              <p className="italic text-gray-800">[Fill in the blank]</p>
            )}
  
            {q.type === "truefalse" && (
              <p className="italic text-gray-800">[True or False]</p>
            )}
          </div>
        ))}
      </div>
    );
  }
  