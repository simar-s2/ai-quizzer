import { NextResponse } from "next/server";
import { GoogleGenAI, Type, createPartFromUri } from "@google/genai";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { 
  QuizInsert, 
  QuestionInsert, 
  DifficultyLevel, 
  QuestionType 
} from "@/lib/supabase/client";

const client = new GoogleGenAI({
  apiKey: process.env.GOOGLE_API_KEY || "",
});

// Type for Gemini response
interface GeminiQuizResponse {
  quiz: {
    title: string;
    description: string;
    subject: string;
    tags: string[];
    difficulty: DifficultyLevel;
  };
  questions: Array<{
    type: QuestionType;
    question_text: string;
    options?: string[];
    answer: string;
    explanation: string;
    marks?: number;
  }>;
}

function cleanGeminiResponse(text: string): string {
  let cleaned = text
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();
  const first = cleaned.indexOf("{");
  const last = cleaned.lastIndexOf("}");
  if (first !== -1 && last !== -1) {
    cleaned = cleaned.slice(first, last + 1);
  }
  return cleaned;
}

async function uploadAndWait(fileBlob: Blob, displayName: string) {
  const file = await client.files.upload({
    file: fileBlob,
    config: { displayName },
  });

  let getFile = await client.files.get({ name: file.name ?? "" });
  while (getFile.state === "PROCESSING") {
    console.log(`Processing ${displayName}...`);
    await new Promise((resolve) => setTimeout(resolve, 5000));
    getFile = await client.files.get({ name: file.name ?? "" });
  }

  if (getFile.state === "FAILED") {
    throw new Error(`File processing failed for ${displayName}`);
  }

  return getFile;
}

async function generateQuiz({
  files,
  text,
  difficulty = "medium",
  numQuestions = 5,
  type = { selectedTypes: [], distribution: {} },
  topic = "",
}: {
  files?: { uri: string; mimeType: string }[];
  text?: string;
  difficulty?: DifficultyLevel;
  numQuestions?: number;
  type?: {
    selectedTypes: QuestionType[];
    distribution: Record<string, number>;
  };
  topic?: string;
}): Promise<GeminiQuizResponse> {
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

  const parts: Array<{ text: string } | ReturnType<typeof createPartFromUri>> = [{ text: basePrompt }];

  if (files) {
    for (const file of files) {
      parts.push(createPartFromUri(file.uri, file.mimeType));
    }
  }

  const response = await client.models.generateContent({
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
    const parsed = JSON.parse(cleaned) as GeminiQuizResponse;
    return parsed;
  } catch (e) {
    console.error("Failed to parse Gemini response:", cleaned, e);
    throw new Error("Failed to parse AI response");
  }
}

export async function POST(req: Request) {
  try {
    const supabase = await createServerSupabaseClient();
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const contentType = req.headers.get("content-type") || "";
    let geminiResponse: GeminiQuizResponse;

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const files = formData.getAll("files") as File[];
      const settings = formData.get("settings")?.toString() || "{}";
      const settingsJson = JSON.parse(settings);

      if (!files || files.length === 0) {
        return NextResponse.json(
          { error: "No files uploaded" },
          { status: 400 }
        );
      }

      const uploadedFiles: { uri: string; mimeType: string }[] = [];

      for (const file of files) {
        const buffer = await file.arrayBuffer();
        const blob = new Blob([buffer], { type: "application/pdf" });
        const uploaded = await uploadAndWait(blob, file.name);
        if (uploaded.uri && uploaded.mimeType) {
          uploadedFiles.push({
            uri: uploaded.uri,
            mimeType: uploaded.mimeType,
          });
        }
      }

      geminiResponse = await generateQuiz({
        files: uploadedFiles,
        ...settingsJson,
      });
    } else {
      const { text, settings } = await req.json();
      geminiResponse = await generateQuiz({ text, ...settings });
    }

    // Save to database with proper types
    const quizInsert: QuizInsert = {
      title: geminiResponse.quiz.title,
      description: geminiResponse.quiz.description,
      subject: geminiResponse.quiz.subject,
      tags: geminiResponse.quiz.tags,
      difficulty: geminiResponse.quiz.difficulty,
      user_id: user.id,
      status: "not_started",
      visibility: "private",
    };

    const { data: quiz, error: quizError } = await supabase
      .from("quizzes")
      .insert(quizInsert)
      .select()
      .single();

    if (quizError || !quiz) {
      throw new Error("Failed to save quiz");
    }

    // Calculate total marks
    const totalMarks = geminiResponse.questions.reduce(
      (sum, q) => sum + (q.marks || 1), 
      0
    );

    // Update total marks
    await supabase
      .from("quizzes")
      .update({ total_marks: totalMarks })
      .eq("id", quiz.id);

    // Save questions with proper types
    const questionsInsert: QuestionInsert[] = geminiResponse.questions.map((q) => ({
      quiz_id: quiz.id,
      type: q.type,
      question_text: q.question_text,
      options: q.options || null,
      answer: q.answer,
      explanation: q.explanation,
      marks: q.marks || 1,
      visibility: "private",
    }));

    const { data: questions, error: questionsError } = await supabase
      .from("questions")
      .insert(questionsInsert)
      .select();

    if (questionsError) {
      throw new Error("Failed to save questions");
    }

    return NextResponse.json({ 
      quiz, 
      questions,
      message: "Quiz created successfully" 
    });
    
  } catch (err) {
    console.error("Error generating quiz:", err);
    const errorMessage = err instanceof Error ? err.message : "Failed to generate quiz";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}