// components/UploadForm.tsx
"use client";
import { useState } from "react";

export default function UploadForm({
  onTextSubmit,
}: {
  onTextSubmit: (text: string) => void;
}) {
  const [text, setText] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim()) {
      onTextSubmit(text);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <label className="block font-medium text-gray-800">
        Paste your notes or textbook content:
      </label>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={8}
        className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2
         focus:ring-blue-500 text-gray-800"
        placeholder="e.g. Photosynthesis is the process by which plants..."
      />
      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
      >
        Generate Quiz
      </button>
    </form>
  );
}
