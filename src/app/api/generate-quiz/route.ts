import { NextResponse } from "next/server";
import { GoogleGenAI, Type, createPartFromUri } from "@google/genai";

const client = new GoogleGenAI({
  apiKey: process.env.GOOGLE_API_KEY || "",
});

// Helper to clean Gemini's response
function cleanGeminiResponse(text: string): string {
  let cleaned = text.replace(/```json/gi, "").replace(/```/g, "").trim();
  const firstBracket = cleaned.indexOf("[");
  const lastBracket = cleaned.lastIndexOf("]");
  if (firstBracket !== -1 && lastBracket !== -1) {
    cleaned = cleaned.slice(firstBracket, lastBracket + 1);
  }
  return cleaned;
}

// Helper to upload and wait for file processing
async function uploadAndWait(fileBlob: Blob, displayName: string) {
  const file = await client.files.upload({
    file: fileBlob,
    config: { displayName },
  });

  let getFile = await client.files.get({ name: file.name ?? '' });
  while (getFile.state === "PROCESSING") {
    console.log(`Processing ${displayName}...`);
    await new Promise((resolve) => setTimeout(resolve, 5000));
    getFile = await client.files.get({ name: file.name ?? '' });
  }

  if (getFile.state === "FAILED") {
    throw new Error(`File processing failed for ${displayName}`);
  }

  return getFile;
}

// Core Gemini function
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
  difficulty?: string;
  numQuestions?: number;
  type?: {
    selectedTypes: string[];
    distribution: Record<string, number>;
  };
  topic?: string;
}) {
  const basePrompt = `Generate ${numQuestions} ${difficulty}-level quiz ${topic} questions based on the ${
    files ? "uploaded PDF documents" : "following text"
  }:
  ${text ? `"${text}"` : ""}
  Return the result strictly as a JSON array. Do not add any explanations or text outside the JSON.
  
  Each quiz question should have:
  - "type": ${type.selectedTypes.join(", ")}
  - "question": the question text
  - "options": an array of 4 options (for mcq only)
  - "answer": the correct answer.
  The distribution of question types should be: 
  - Equally split or if there is a distribution:
  - ${Object.keys(type.distribution).map((key) => `${key}: ${type.distribution[key]}`).join(", ")}`;

  const parts: any[] = [{ text: basePrompt }];

  if (files) {
    for (const file of files) {
      parts.push(createPartFromUri(file.uri, file.mimeType));
    }
  }

  const response = await client.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [{ role: "user", parts }],
    ...(text
      ? {
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  type: { type: Type.STRING },
                  question: { type: Type.STRING },
                  options: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  answer: { type: Type.STRING },
                },
                propertyOrdering: ["type", "question", "options", "answer"],
              },
            },
          },
        }
      : {}),
  });

  let quiz: any[] = [];
  if (response.text && response.text.length > 0) {
    const cleaned = cleanGeminiResponse(response.text);
    try {
      quiz = JSON.parse(cleaned);
    } catch (e) {
      console.error("Failed to parse Gemini response:", cleaned);
    }
  }

  return quiz;
}

export async function POST(req: Request) {
  try {
    const contentType = req.headers.get("content-type") || "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const files = formData.getAll("files") as File[]; // "files" key for multiple
      const settings = formData.get("settings")?.toString() || "{}";
      const settingsJson = JSON.parse(settings);

      if (!files || files.length === 0) {
        return NextResponse.json({ error: "No files uploaded" }, { status: 400 });
      }

      const uploadedFiles: { uri: string; mimeType: string }[] = [];

      for (const file of files) {
        const buffer = await file.arrayBuffer();
        const blob = new Blob([buffer], { type: "application/pdf" });
        const uploaded = await uploadAndWait(blob, file.name);
        if (uploaded.uri && uploaded.mimeType) {
          uploadedFiles.push({ uri: uploaded.uri, mimeType: uploaded.mimeType });
        }
      }

      const quiz = await generateQuiz({ files: uploadedFiles, ...settingsJson });
      return NextResponse.json({ quiz });
    } else {
      // Handle JSON text input
      const { text, settings } = await req.json();
      const quiz = await generateQuiz({ text, ...settings });
      return NextResponse.json({ quiz });
    }
  } catch (err: any) {
    console.error("Error generating quiz:", err);
    return NextResponse.json({ error: "Failed to generate quiz" }, { status: 500 });
  }
}
