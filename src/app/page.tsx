"use client";
import TextUploadForm from "../components/TextUploadForm";
import PdfUploadForm from "../components/PdfUploadForm";
import QuizPreview from "../components/QuizPreview";
import { useState } from "react";
import Spinner from "@/components/Spinner";

export default function Home() {
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [loading, setLoading] = useState(false);

  type QuizQuestion = {
    type: "mcq" | "fill" | "truefalse";
    question: string;
    options?: string[];
    answer: string;
  };

  const handleTextSubmit = async (text: string) => {
    setQuizQuestions([]);
    setLoading(true);
    try {
      const res = await fetch("/api/generate-quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();
      setQuizQuestions(data.quiz);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePdfUpload = async (file: File) => {
    setQuizQuestions([]);
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/generate-quiz", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      setQuizQuestions(data.quiz);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-3xl mx-auto bg-white shadow-xl rounded-2xl p-6">
        <h1 className="text-2xl font-bold mb-4 text-gray-800">🧠 AI Quiz Generator</h1>

        <div className="space-y-6">
          <TextUploadForm onTextSubmit={handleTextSubmit} />
          <PdfUploadForm onPdfUpload={handlePdfUpload} />
        </div>

        <hr className="my-6" />

        {loading ? <Spinner /> : quizQuestions.length > 0 && <QuizPreview questions={Array.isArray(quizQuestions) ? quizQuestions : []} />
      }
      </div>
    </main>
  );
}
