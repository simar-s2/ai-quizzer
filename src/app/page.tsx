"use client";

import { useState } from "react";
import QuizPreview from "../components/QuizPreview";
import UploadForm from "../components/UploadForm";
import Spinner from "@/components/Spinner";
import QuizSettings from "../components/QuizSettings";

// Type definition for a quiz question
type QuizQuestion = {
  type: "mcq" | "fill" | "truefalse" | "shortanswer" | "essay";
  question: string;
  options?: string[];
  answer: string;
};

export default function Home() {
  // State variables
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [quizSettings, setQuizSettings] = useState({
    difficulty: "medium",
    numQuestions: 5,
    type: {
      selectedTypes: [],
      distribution: {
        mcq: 0,
        fill: 0,
        truefalse: 0,
        shortanswer: 0,
        essay: 0,
      },
    },
  });

  // Function to handle text submission
  const handleTextSubmit = async (text: string) => {
    setQuizQuestions([]);
    setLoading(true);
    try {
      const res = await fetch("/api/generate-quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, settings: quizSettings }),
      });

      const data = await res.json();
      setQuizQuestions(data.quiz);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Function to handle multiple PDF uploads
  const handlePdfUpload = async (files: File[]) => {
    setQuizQuestions([]);
    setLoading(true);
    try {
      const formData = new FormData();
      files.forEach((file) => formData.append("files", file));
      formData.append("settings", JSON.stringify(quizSettings));

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

  // Render the page
  return (
    <main className="min-h-screen">
      <div className="flex flex-col justify-items-center max-w-2/3 mx-auto gap-4">
        <h1 className="text-2xl font-bold">🧠 AI Quiz Generator</h1>
        <UploadForm
          onTextSubmit={handleTextSubmit}
          onPdfUpload={handlePdfUpload} // now expects multiple files
        />
        <QuizSettings
          quizSettings={quizSettings}
          setQuizSettings={setQuizSettings}
        />
        <hr className="my-6" />
        {loading ? (
          <div className="flex justify-center items-center">
            <Spinner />
          </div>
        ) : quizQuestions.length > 0 ? (
          <QuizPreview
            questions={Array.isArray(quizQuestions) ? quizQuestions : []}
          />
        ) : null}
      </div>
    </main>
  );
}
