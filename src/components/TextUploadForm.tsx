"use client";

import { useState } from "react";

export default function TextUploadForm({ onTextSubmit }: { onTextSubmit: (text: string) => void }) {
  const [text, setText] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim()) {
      onTextSubmit(text);
      setText("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <textarea
        placeholder="Enter or paste text for quiz"
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="border p-2 rounded resize min-h-[100px] focus:outline-none focus:ring-2 focus:ring-blue-400"
      />
      <button
        type="submit"
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 self-start"
      >
        Generate from Text
      </button>
    </form>
  );
}
