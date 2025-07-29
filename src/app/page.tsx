"use client";
import QuizPreview from "../components/QuizPreview";
import UploadForm from "../components/UploadForm";
import Spinner from "@/components/Spinner";
import QuizSettings from "../components/QuizSettings";
import { useState } from "react";

export default function Home() {
  // State variables
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [quizSettings, useQuizSettings] = useState({
    difficulty: "medium",
    numQuestions: 5,
    type: {
      selectedTypes: [],
      distribution: {
        mcq: 0,
        fill: 0,
        truefalse: 0,
      },
    },
  });

  // Type definition for a quiz question
  type QuizQuestion = {
    type: "mcq" | "fill" | "truefalse";
    question: string;
    options?: string[];
    answer: string;
  };

  // Function to handle text submission
  const handleTextSubmit = async (text: string) => {
    // Clear the quiz questions and set loading to true
    setQuizQuestions([]);
    setLoading(true);
    try {
      // Call the API to generate the quiz
      const res = await fetch("/api/generate-quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, settings: quizSettings }),
      });
      // Get the quiz questions from the response
      const data = await res.json();
      setQuizQuestions(data.quiz);
    } catch (err) {
      // Catch any errors and log them
      console.error(err);
    } finally {
      // Set loading to false when done
      setLoading(false);
    }
  };

  // Function to handle PDF uploads
  const handlePdfUpload = async (file: File) => {
    // Clear the quiz questions and set loading to true
    setQuizQuestions([]);
    setLoading(true);
    try {
      // Create a form data object and add the file to it
      const formData = new FormData();
      formData.append("file", file);
      formData.append("settings", JSON.stringify(quizSettings));

      // Call the API to generate the quiz
      const res = await fetch("/api/generate-quiz", {
        method: "POST",
        body: formData,
      });
      // Get the quiz questions from the response
      const data = await res.json();
      setQuizQuestions(data.quiz);
    } catch (err) {
      // Catch any errors and log them
      console.error(err);
    } finally {
      // Set loading to false when done
      setLoading(false);
    }
  };

  // Render the page
  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-3xl mx-auto bg-white shadow-xl rounded-2xl p-6">
        <h1 className="text-2xl font-bold mb-4 text-gray-800">🧠 AI Quiz Generator</h1>

        <div className="w-full space-y-6">
          <UploadForm onTextSubmit={handleTextSubmit} onPdfUpload={handlePdfUpload} />
          <QuizSettings quizSettings={quizSettings} setQuizSettings={useQuizSettings} />
        </div>

        <hr className="my-6" />

        {loading ? <div className="flex justify-center items-center"><Spinner /></div> : quizQuestions.length > 0 && <QuizPreview questions={Array.isArray(quizQuestions) ? quizQuestions : []} />}
      </div>
    </main>
  );
}
