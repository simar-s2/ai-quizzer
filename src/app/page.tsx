'use client';

import UploadForm from "../components/UploadForm";
import QuizPreview from "../components/QuizPreview";
import { useState } from "react";

export default function Home() {
  const [quizText, setQuizText] = useState("");
  const [quizQuestions, setQuizQuestions] = useState([]);

  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-3xl mx-auto bg-white shadow-xl rounded-2xl p-6">
        <h1 className="text-2xl font-bold mb-4 text-gray-800">🧠 AI Quiz Generator</h1>

        <UploadForm
          onTextSubmit={(text: string) => {
            setQuizText(text);
            // TODO: send text to GPT
          }}
        />

        <hr className="my-6" />

        <QuizPreview questions={quizQuestions} />
      </div>
    </main>
  );
}
