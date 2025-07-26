"use client";

import { useState } from "react";

type UploadType = "pdf" | "text";

export default function UploadForm({
  onPdfUpload,
  onTextSubmit,
}: {
  onPdfUpload: (file: File) => void;
  onTextSubmit: (text: string) => void;
}) {
  const [uploadType, setUploadType] = useState<UploadType>("pdf");
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [text, setText] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (uploadType === "pdf" && pdfFile) {
      onPdfUpload(pdfFile);
      setPdfFile(null);
    } else if (uploadType === "text" && text.trim()) {
      onTextSubmit(text);
      setText("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Upload type toggle */}
      <div className="flex gap-4">
        <label className="flex items-center gap-2">
          <input
            type="radio"
            value="pdf"
            checked={uploadType === "pdf"}
            onChange={() => setUploadType("pdf")}
            className="accent-blue-500"
          />
          PDF Upload
        </label>
        <label className="flex items-center gap-2">
          <input
            type="radio"
            value="text"
            checked={uploadType === "text"}
            onChange={() => setUploadType("text")}
            className="accent-blue-500"
          />
          Text Upload
        </label>
      </div>

      {/* Conditional input */}
      {uploadType === "pdf" ? (
        <input
          type="file"
          accept="application/pdf"
          onChange={(e) =>
            setPdfFile(e.target.files && e.target.files[0] ? e.target.files[0] : null)
          }
          className="border p-2 rounded text-gray-500 border-gray-300 w-full"
        />
      ) : (
        <textarea
          placeholder="Enter or paste text for quiz"
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="border p-2 rounded text-black border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-y min-h-[100px] w-full"
        />
      )}

      {/* Submit */}
      <button
        type="submit"
        className="px-4 py-2 rounded text-white bg-blue-500 hover:bg-blue-600"
      >
        {uploadType === "pdf" ? "Generate from PDF" : "Generate from Text"}
      </button>
    </form>
  );
}
