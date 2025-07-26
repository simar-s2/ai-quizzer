import { NextResponse } from "next/server";
import { GoogleGenAI, Type } from "@google/genai";

const client = new GoogleGenAI({
  apiKey: process.env.GOOGLE_API_KEY || "",
});

// Remove code fences and extra text
function cleanGeminiResponse(text: string): string {
  // Remove code fences
  let cleaned = text
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();

  // Try to find the first valid JSON array in the string
  const firstBracket = cleaned.indexOf("[");
  const lastBracket = cleaned.lastIndexOf("]");
  if (firstBracket !== -1 && lastBracket !== -1) {
    cleaned = cleaned.slice(firstBracket, lastBracket + 1);
  }
  
  return cleaned;
}

// Generic function to call Gemini
async function generateQuiz({
  text,
  pdfBase64,
  difficulty = "medium",
}: {
  text?: string;
  pdfBase64?: string;
  difficulty?: string;
}) {
  const basePrompt = `Generate 5 ${difficulty}-level quiz questions based on the ${
    pdfBase64 ? "PDF file" : "following text"
  }:
  ${text ? `"${text}"` : ""}
  Return the result strictly as a JSON array. Do not add any explanations or text outside the JSON.
  
  Each quiz question should have:
  - "type": "mcq" or "fill"
  - "question": the question text
  - "options": an array of 4 options (for mcq only)
  - "answer": the correct answer.`;
  

  const contents: any[] = [{ role: "user", parts: [{ text: basePrompt }] }];

  if (pdfBase64) {
    contents[0].parts.push({
      inlineData: {
        mimeType: "application/pdf",
        data: pdfBase64,
      },
    });
  }

  const response = await client.models.generateContent({
    model: "gemini-2.5-flash",
    contents,
    ...(text
      ? {
          // For text, we can enforce JSON schema
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
      // Handle PDF Upload
      const formData = await req.formData();
      const file = formData.get("file") as File | null;
      if (!file) {
        return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
      }

      const arrayBuffer = await file.arrayBuffer();
      const base64PDF = Buffer.from(arrayBuffer).toString("base64");
      const difficulty = formData.get("difficulty")?.toString() || "medium"; // default
      const quiz = await generateQuiz({ pdfBase64: base64PDF, difficulty });
      return NextResponse.json({ quiz });
    } else {
      // Handle Text Input
      const { text, difficulty } = await req.json();
      const quiz = await generateQuiz({ text, difficulty });
      return NextResponse.json({ quiz });
    }
  } catch (err: any) {
    console.error("Error generating quiz:", err);
    return NextResponse.json({ error: "Failed to generate quiz" }, { status: 500 });
  }
}
