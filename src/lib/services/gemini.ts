import { GoogleGenAI, Type, createPartFromUri } from "@google/genai";
import type {
  IGenAIService,
  GenerateQuizParams,
  GenerateQuizResponse,
  AnswerToMark,
  MarkQuizResponse,
  MarkingResult,
  FileUploadResult,
} from "./types";

function cleanGeminiResponse(text: string): string {
  let cleaned = text.replace(/```json/gi, "").replace(/```/g, "").trim();
  const first = cleaned.indexOf("{");
  const last = cleaned.lastIndexOf("}");
  if (first !== -1 && last !== -1) {
    cleaned = cleaned.slice(first, last + 1);
  }
  return cleaned;
}

export class GeminiGenAIService implements IGenAIService {
  private client: GoogleGenAI;

  constructor(apiKey: string) {
    this.client = new GoogleGenAI({ apiKey });
  }

  async uploadFile(fileBlob: Blob, displayName: string): Promise<FileUploadResult> {
    const file = await this.client.files.upload({
      file: fileBlob,
      config: { displayName },
    });

    let getFile = await this.client.files.get({ name: file.name ?? "" });
    while (getFile.state === "PROCESSING") {
      await new Promise((resolve) => setTimeout(resolve, 5000));
      getFile = await this.client.files.get({ name: file.name ?? "" });
    }

    if (getFile.state === "FAILED") {
      throw new Error(`File processing failed for ${displayName}`);
    }

    if (!getFile.uri || !getFile.mimeType) {
      throw new Error(`File upload incomplete for ${displayName}`);
    }

    return {
      uri: getFile.uri,
      mimeType: getFile.mimeType,
    };
  }

  async generateQuiz(params: GenerateQuizParams): Promise<GenerateQuizResponse> {
    const {
      files,
      text,
      difficulty = "medium",
      numQuestions = 5,
      type = { selectedTypes: [], distribution: {} },
      topic = "",
    } = params;

    const distributionText =
      Object.keys(type.distribution).length > 0
        ? Object.entries(type.distribution)
            .map(([key, value]) => `${key}: ${value}`)
            .join(", ")
        : "evenly distributed";

    const basePrompt = `
    You are an expert quiz creator. Produce exactly ${numQuestions}
    ${difficulty}-level quiz questions on the subject "${topic}"
    based on the ${files ? "uploaded PDF documents" : "following text"} below:
    ${text || "(no inline text provided)"}

    Use this distribution of question types: ${distributionText}.
    Allow only these types: ${type.selectedTypes.join(", ")}.

    Respond with a single JSON object matching this schema exactly
    (no extra keys, no markdown, no commentary):

    {
      "quiz": {
        "title": "string",
        "description": "string",
        "subject": "string",
        "tags": ["string"],
        "difficulty": "easy" | "medium" | "hard" | "expert"
      },
      "questions": [
        {
          "type": "mcq" | "fill" | "truefalse" | "shortanswer" | "essay",
          "question_text": "string",
          "options": ["string"],
          "answer": "string",
          "explanation": "string",
          "marks": number
        }
      ]
    }
    Output JSON only.
  `.trim();

    const parts: Array<{ text: string } | ReturnType<typeof createPartFromUri>> = [
      { text: basePrompt },
    ];

    if (files) {
      for (const file of files) {
        parts.push(createPartFromUri(file.uri, file.mimeType));
      }
    }

    const response = await this.client.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: "user", parts }],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            quiz: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                description: { type: Type.STRING },
                subject: { type: Type.STRING },
                tags: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                difficulty: {
                  type: Type.STRING,
                  enum: ["easy", "medium", "hard", "expert"],
                },
              },
              required: ["title", "description", "subject", "difficulty", "tags"],
            },
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  type: {
                    type: Type.STRING,
                    enum: ["mcq", "fill", "truefalse", "shortanswer", "essay"],
                  },
                  question_text: { type: Type.STRING },
                  options: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  answer: { type: Type.STRING },
                  explanation: { type: Type.STRING },
                  marks: { type: Type.NUMBER },
                },
                required: ["type", "question_text", "answer", "explanation"],
              },
            },
          },
          required: ["quiz", "questions"],
        },
      },
    });

    const cleaned = cleanGeminiResponse(response.text || "");
    try {
      const parsed = JSON.parse(cleaned) as GenerateQuizResponse;
      return parsed;
    } catch {
      throw new Error("Failed to parse quiz generation response");
    }
  }

  async markAnswers(answers: AnswerToMark[]): Promise<MarkQuizResponse> {
    const autoMarkable = answers.filter(
      (a) => a.question_type === "mcq" || a.question_type === "truefalse" || a.question_type === "fill"
    );
    const manualMark = answers.filter(
      (a) => a.question_type === "shortanswer" || a.question_type === "essay"
    );

    const results: MarkingResult[] = [];

    for (const answer of autoMarkable) {
      const userAnswer = answer.user_answer?.trim().toLowerCase() || "";
      const correctAnswer = answer.correct_answer?.trim().toLowerCase() || "";
      const isCorrect = userAnswer === correctAnswer;

      results.push({
        question_id: answer.question_id,
        is_correct: isCorrect,
        correctness_status: isCorrect ? "correct" : "incorrect",
        marks_awarded: isCorrect ? answer.marks_possible : 0,
        marks_possible: answer.marks_possible,
        feedback: isCorrect
          ? "Correct! Well done."
          : `Incorrect. The correct answer is: ${answer.correct_answer}`,
      });
    }

    if (manualMark.length > 0) {
      const prompt = `You are an expert teacher marking student answers. For each answer provided, give:
1. A score out of the maximum marks possible (can be decimal for partial credit)
2. Constructive, DETAILED feedback explaining why the student received that score
3. What they did well and what could be improved

IMPORTANT INSTRUCTIONS:
- Mark fairly but critically. Award full marks only for comprehensive, accurate answers.
- Give partial credit (0.5 to marks_possible-0.5) for partially correct answers based on how much of the key concepts they covered.
- Provide DETAILED, THOROUGH feedback. Do NOT truncate or cut off your feedback.
- Write complete sentences and paragraphs. Include specific examples of what the student did right or wrong.
- The feedback should be AT LEAST 2-3 complete sentences, and longer for complex answers.

Questions and Answers to Mark:
${manualMark
  .map(
    (a, i) => `
Question ${i} (${a.marks_possible} marks):
${a.question_text}

Model Answer/Expected Content:
${a.correct_answer}

${a.explanation ? `Additional Context: ${a.explanation}` : ""}

Student's Answer:
${a.user_answer || "(No answer provided)"}
`
  )
  .join("\n---\n")}

For each question, provide:
- question_index: the index number (0, 1, 2, etc.)
- marks_awarded: decimal number between 0 and the marks_possible
- feedback: DETAILED, THOROUGH constructive feedback (minimum 2-3 complete sentences, longer for complex answers)`;

      try {
        const response = await this.client.models.generateContent({
          model: "gemini-2.5-flash",
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                marked_answers: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      question_index: { type: Type.NUMBER },
                      marks_awarded: { type: Type.NUMBER },
                      feedback: { type: Type.STRING },
                    },
                    required: ["question_index", "marks_awarded", "feedback"],
                  },
                },
              },
              required: ["marked_answers"],
            },
          },
        });

        const aiResult = JSON.parse(response.text || "{}") as {
          marked_answers: Array<{
            question_index: number;
            marks_awarded: number;
            feedback: string;
          }>;
        };

        aiResult.marked_answers.forEach((marked) => {
          const question = manualMark[marked.question_index];
          if (!question) {
            return;
          }

          const marksAwarded = Math.min(Math.max(0, marked.marks_awarded), question.marks_possible);

          let correctnessStatus: "correct" | "partial" | "incorrect";
          if (marksAwarded >= question.marks_possible) {
            correctnessStatus = "correct";
          } else if (marksAwarded > 0) {
            correctnessStatus = "partial";
          } else {
            correctnessStatus = "incorrect";
          }

          const isCorrect = correctnessStatus === "correct";

          results.push({
            question_id: question.question_id,
            is_correct: isCorrect,
            correctness_status: correctnessStatus,
            marks_awarded: Math.round(marksAwarded * 100) / 100,
            marks_possible: question.marks_possible,
            feedback: marked.feedback || "Answer received.",
          });
        });
      } catch {
        this.applyFallbackMarking(manualMark, results);
      }
    }

    const totalMarksAwarded = results.reduce((sum, r) => sum + r.marks_awarded, 0);
    const totalMarksPossible = results.reduce((sum, r) => sum + r.marks_possible, 0);
    const percentage = totalMarksPossible > 0 ? (totalMarksAwarded / totalMarksPossible) * 100 : 0;

    let overallFeedback = "";
    if (percentage >= 90) {
      overallFeedback =
        "Outstanding work! You demonstrated excellent understanding of the material with comprehensive and well-structured answers.";
    } else if (percentage >= 75) {
      overallFeedback =
        "Great job! You showed strong comprehension of the key concepts. Review the feedback for areas where you can further strengthen your understanding.";
    } else if (percentage >= 60) {
      overallFeedback =
        "Good effort! You are on the right track and understand several important concepts. Focus on the feedback provided to fill in the gaps and deepen your knowledge.";
    } else if (percentage >= 50) {
      overallFeedback =
        "You are making progress and have grasped some basic concepts. Take time to review the material thoroughly and focus on the areas highlighted in the feedback to improve your understanding.";
    } else {
      overallFeedback =
        "Keep studying and do not give up! Review the correct answers carefully and try to understand the underlying concepts. The feedback provided will help guide your learning. Consider reviewing the material again before your next attempt.";
    }

    return {
      overall_feedback: overallFeedback,
      total_marks_possible: totalMarksPossible,
      total_marks_awarded: totalMarksAwarded,
      percentage: Math.round(percentage * 100) / 100,
      question_results: results,
    };
  }

  private applyFallbackMarking(manualMark: AnswerToMark[], results: MarkingResult[]): void {
    manualMark.forEach((question) => {
      const userAnswer = question.user_answer?.trim() || "";
      const correctAnswer = question.correct_answer?.trim().toLowerCase() || "";
      const userAnswerLower = userAnswer.toLowerCase();

      let marksAwarded = 0;
      let feedback = "";
      let correctnessStatus: "correct" | "partial" | "incorrect" = "incorrect";

      if (!userAnswer) {
        marksAwarded = 0;
        feedback = "No answer provided.";
        correctnessStatus = "incorrect";
      } else {
        const correctWords = correctAnswer.split(/\s+/).filter((w) => w.length > 3);
        const userWords = userAnswerLower.split(/\s+/);
        const matchingWords = correctWords.filter((word) =>
          userWords.some((uw) => uw.includes(word) || word.includes(uw))
        );

        const matchRatio = correctWords.length > 0 ? matchingWords.length / correctWords.length : 0;

        if (matchRatio >= 0.8) {
          marksAwarded = question.marks_possible * 0.9;
          feedback =
            "Your answer covers most of the key points and demonstrates a strong understanding of the material. Well done! You have clearly explained the main concepts with relevant details and examples.";
          correctnessStatus = marksAwarded >= question.marks_possible ? "correct" : "partial";
        } else if (matchRatio >= 0.6) {
          marksAwarded = question.marks_possible * 0.7;
          feedback =
            "Your answer includes several correct elements and shows good understanding of the topic. To improve your score, consider adding more detail and depth to your explanation. Make sure to address all aspects of the question and provide specific examples where relevant.";
          correctnessStatus = "partial";
        } else if (matchRatio >= 0.4) {
          marksAwarded = question.marks_possible * 0.5;
          feedback =
            "Your answer touches on some relevant points but needs more development and depth. You have identified some key ideas, but the explanation could be more thorough and comprehensive. Review the material carefully and ensure you understand the core concepts before attempting similar questions.";
          correctnessStatus = "partial";
        } else if (matchRatio >= 0.2) {
          marksAwarded = question.marks_possible * 0.3;
          feedback =
            "Your answer shows some basic understanding but is missing several key elements and lacks sufficient detail. The response needs significant improvement in both content and explanation. I recommend reviewing the correct answer carefully and identifying which important concepts you missed in your response.";
          correctnessStatus = "partial";
        } else {
          marksAwarded = question.marks_possible * 0.1;
          feedback =
            "Your answer does not adequately address the question and is missing most of the key concepts required for a complete response. Please review the material thoroughly and focus on understanding the fundamental principles. Take time to study the correct answer and identify what information was expected in a comprehensive response.";
          correctnessStatus = marksAwarded > 0 ? "partial" : "incorrect";
        }
      }

      results.push({
        question_id: question.question_id,
        is_correct: correctnessStatus === "correct",
        correctness_status: correctnessStatus,
        marks_awarded: Math.round(marksAwarded * 100) / 100,
        marks_possible: question.marks_possible,
        feedback: feedback,
      });
    });
  }
}
