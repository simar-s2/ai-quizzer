"use client";
import { useQuizStore } from "./useQuizStore";
import type { QuizSettingsType } from "@/types/quiz-settings";

// Extracts complete question objects from a partial JSON buffer as they appear.
// Gemini streams raw JSON text — this regex pulls out complete question blocks
// before the full JSON is parseable, enabling question-by-question pop-in.
function extractQuestionsFromBuffer(buffer: string): unknown[] {
  const questions: unknown[] = [];
  // Match complete JSON objects that contain "question_text" (a reliable question marker)
  const regex = /\{(?:[^{}]|\{[^{}]*\})*"question_text"(?:[^{}]|\{[^{}]*\})*\}/g;
  const matches = buffer.match(regex);
  if (matches) {
    for (const match of matches) {
      try {
        questions.push(JSON.parse(match));
      } catch {
        // incomplete match, skip
      }
    }
  }
  return questions;
}

function extractQuizMetaFromBuffer(buffer: string): unknown | null {
  // Match the quiz metadata object
  const match = buffer.match(/"quiz"\s*:\s*(\{[^}]+\})/);
  if (match) {
    try {
      return JSON.parse(match[1]);
    } catch {
      return null;
    }
  }
  return null;
}

export function useGenerateQuizStream() {
  const {
    setIsStreaming,
    appendStreamedQuestion,
    setStreamedQuiz,
    setStreamError,
    resetStream,
  } = useQuizStore();

  const generate = async (
    payload: { text?: string; settings?: QuizSettingsType } | FormData,
    isFormData: boolean
  ) => {
    resetStream();
    setIsStreaming(true);

    const seenQuestionTexts = new Set<string>();

    try {
      const res = await fetch("/api/generate-quiz-stream", {
        method: "POST",
        ...(isFormData
          ? { body: payload as FormData }
          : {
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
            }),
      });

      if (!res.ok || !res.body) {
        const err = await res.json().catch(() => ({ error: "Stream failed" }));
        throw new Error(err.error || "Stream failed");
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let quizMetaSet = false;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        // Try to extract quiz metadata once it appears
        if (!quizMetaSet) {
          const meta = extractQuizMetaFromBuffer(buffer);
          if (meta) {
            setStreamedQuiz(meta as Parameters<typeof setStreamedQuiz>[0]);
            quizMetaSet = true;
          }
        }

        // Progressively extract questions as they appear in the buffer
        const questions = extractQuestionsFromBuffer(buffer);
        for (const q of questions) {
          const question = q as { question_text?: string };
          if (question.question_text && !seenQuestionTexts.has(question.question_text)) {
            seenQuestionTexts.add(question.question_text);
            appendStreamedQuestion(q as Parameters<typeof appendStreamedQuestion>[0]);
          }
        }
      }

      // Final parse for anything missed (e.g. quiz meta didn't appear mid-stream)
      try {
        const cleaned = buffer
          .replace(/```json/gi, "")
          .replace(/```/g, "")
          .trim();
        const parsed = JSON.parse(cleaned);
        if (parsed.quiz && !quizMetaSet) {
          setStreamedQuiz(parsed.quiz);
        }
        // Catch any questions the regex missed
        if (parsed.questions) {
          for (const q of parsed.questions) {
            if (!seenQuestionTexts.has(q.question_text)) {
              seenQuestionTexts.add(q.question_text);
              appendStreamedQuestion(q);
            }
          }
        }
      } catch {
        // buffer already partially rendered, not fatal
      }
    } catch (err) {
      setStreamError(err instanceof Error ? err.message : "Stream error");
    } finally {
      setIsStreaming(false);
    }
  };

  return { generate };
}