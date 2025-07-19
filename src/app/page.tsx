'use client';

import UploadForm from "../components/UploadForm";
import QuizPreview from "../components/QuizPreview";
import { useState } from "react";
import { generateMockQuiz } from "../lib/generateMockQuiz";

export default function Home() {
  const [quizText, setQuizText] = useState("");
  type QuizQuestion = {
    type: "mcq" | "fill" | "truefalse";
    question: string;
    options?: string[];
    answer: string;
  };
  
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  

  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-3xl mx-auto bg-white shadow-xl rounded-2xl p-6">
        <h1 className="text-2xl font-bold mb-4 text-gray-800">🧠 AI Quiz Generator</h1>

        <UploadForm
          onTextSubmit={(text: string) => {
            setQuizText(text);
            const generated = generateMockQuiz(text);
            setQuizQuestions(generated);
          }}
        />

        <hr className="my-6" />

        <QuizPreview questions={quizQuestions} />
      </div>
    </main>
  );
}
