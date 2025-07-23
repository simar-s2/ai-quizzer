"use client";

import { useState } from "react";

export default function PdfUploadForm({ onPdfUpload }: { onPdfUpload: (file: File) => void }) {
  const [pdfFile, setPdfFile] = useState<File | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPdfFile(e.target.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pdfFile) {
      onPdfUpload(pdfFile);
      setPdfFile(null);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 items-center">
      <input
        type="file"
        accept="application/pdf"
        onChange={handleChange}
        className="border p-2 rounded"
      />
      <button
        type="submit"
        className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
      >
        Generate from PDF
      </button>
    </form>
  );
}
