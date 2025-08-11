import { jsPDF } from "jspdf";
import type { QuizQuestion } from "@/app/types";
import type { Quiz } from "@/app/types";

export function exportQuizQuestions(questions: QuizQuestion[], quiz = {} as Quiz, filename = `${quiz.title}.pdf`) {
  const doc = new jsPDF();
  const margin = 20;
  const maxWidth = 140;
  const lineHeight = 6;
  const dots = ".".repeat(200); // extended dotted line
  let y = margin;

  doc.setFont("Arial", "bold");
  doc.setFontSize(14);
  doc.text(quiz.title, margin, y);
  y += lineHeight;
  doc.setFontSize(11);
  doc.setFont("Arial", "normal");
  const descriptionLines = doc.splitTextToSize(
    quiz.description? quiz.description : "No description provided.", maxWidth);
  doc.text(descriptionLines, margin, y);
  y += descriptionLines.length * lineHeight + 4;

  questions.forEach((q, i) => {
    if (y > 270) {
      doc.addPage();
      y = margin;
    }

    // Wrap question text
    const wrappedQuestion = doc.splitTextToSize(`Q${i + 1}: ${q.question_text}`, maxWidth);
    doc.setFont("Arial", "bold");
    wrappedQuestion.forEach((line:string, idx:number) => {
      doc.text(line, margin, y);
      if (idx === 0) doc.text("[1]", 180, y);
      y += lineHeight;
    });

    doc.setFont("Arial", "normal");

    // Render options or answer space
    if (q.options && q.options.length > 0) {
      q.options.forEach((opt, idx) => {
        doc.text(`   ${opt}`, margin + 4, y);
        y += lineHeight;
      });
    } else if (q.type === "truefalse") {
      doc.text("   A) True", margin + 4, y);
      y += lineHeight;
      doc.text("   B) False", margin + 4, y);
      y += lineHeight;
    } else {
      const lines =
        q.type === "essay" ? 20 :
        q.type === "shortanswer" ? 5 :
        q.type === "fill" ? 0 : 1;

      if (lines > 0) {
        doc.setFontSize(8); // smaller font for dotted lines
        for (let l = 0; l < lines; l++) {
          doc.text(dots, margin + 4, y);
          y += lineHeight;
          if (y > 270 && l < lines - 1) {
            doc.addPage();
            y = margin;
          }
        }
        doc.setFontSize(11); // reset font size
      }
    }

    y += lineHeight;
  });

  doc.save(filename);
}

export function exportQuizMarkscheme(questions: QuizQuestion[], quiz = {} as Quiz, filename = `${quiz.title} markscheme.pdf`) {
  const doc = new jsPDF();
  const margin = 20;
  const maxWidth = 140;
  const lineHeight = 6;
  let y = margin;

  doc.setFont("Arial", "bold");
  doc.setFontSize(14);
  doc.text("Quiz Markscheme", margin, y);
  y += 12;

  doc.setFontSize(11);
  doc.setFont("Arial", "normal");

  questions.forEach((q, i) => {
    if (y > 270) {
      doc.addPage();
      y = margin;
    }

    const wrappedAnswer = doc.splitTextToSize(`Q${i + 1}: ${q.answer}`, maxWidth);
    wrappedAnswer.forEach((line: string) => {
      if (y > 270) {
        doc.addPage();
        y = margin;
      }
      doc.text(line, margin, y);
      y += lineHeight;
    });

    y += lineHeight;
  });

  doc.save(filename);
}
