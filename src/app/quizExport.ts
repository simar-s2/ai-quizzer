// src/lib/quizExport.ts
import { jsPDF } from "jspdf";
import type QuizQuestion from "@/app/types";

export function exportQuizQuestions(questions: QuizQuestion[], filename = "Quiz_Questions.pdf") {
  const doc = new jsPDF();
  let y = 10;

  questions.forEach((q, i) => {
    doc.text(`Q${i + 1}: ${q.question}`, 10, y);
    y += 10;

    if (q.options) {
      q.options.forEach((opt, idx) => {
        doc.text(`   ${String.fromCharCode(65 + idx)}) ${opt}`, 14, y);
        y += 8;
      });
    } else {
      doc.text("   Answer: ____________________________", 14, y);
      y += 8;
    }

    y += 4;
  });

  doc.save(filename);
}

export function exportQuizMarkscheme(questions: QuizQuestion[], filename = "Quiz_MarkScheme.pdf") {
  const doc = new jsPDF();
  let y = 10;

  questions.forEach((q, i) => {
    doc.text(`Q${i + 1}: ${q.question}`, 10, y);
    y += 10;

    doc.text(`Answer: ${q.answer}`, 14, y);
    y += 8;

    doc.text(`Topic: ${q.topic}`, 14, y);
    y += 12;
  });

  doc.save(filename);
}
