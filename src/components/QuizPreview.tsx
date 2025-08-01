import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";



export default function QuizPreview({
    questions,
  }: {
    questions: { type: string; question: string; options?: string[]; answer?: string }[];
  }) {
    if (!questions || questions.length === 0) {
      return <p className="text-gray-800">No quiz generated yet.</p>;
    }
  
    return (
      <Card className="p-4">
        <CardTitle className="text-xl font-semibold mb-2 text-gray-800">📋 Generated Quiz</CardTitle>

        {questions.map((q, idx) => (
          <Card key={idx} className="p-4">
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

            {q.type === "shortanswer" && (
              <p className="italic text-gray-800">[Short Answer]</p>
            )}
  
            {q.type === "essay" && (
              <p className="italic text-gray-800">[Essay]</p>
            )}
  
          </Card>
        ))}
      </Card>
    );
  }
  