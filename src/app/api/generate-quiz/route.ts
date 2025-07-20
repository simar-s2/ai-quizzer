import { NextResponse } from "next/server";
import { GoogleGenAI, Type } from "@google/genai";

const client = new GoogleGenAI({
  apiKey: process.env.GOOGLE_API_KEY || "",
});

export async function POST(req: Request) {
  try {
    const { text } = await req.json();

    const prompt = `Generate 5 quiz questions based on the following text:
    "${text}"
    Include a mix of multiple-choice (mcq) and fill-in-the-blank (fill) questions.
    For mcq, always include exactly 4 options and specify the correct answer.
    For fill, provide a single correct answer.
    `;

    const response = await client.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              type: { type: Type.STRING },       // "mcq" or "fill"
              question: { type: Type.STRING },   // Question text
              options: {                         // Array of options (MCQ only)
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              answer: { type: Type.STRING },     // Correct answer
            },
            propertyOrdering: ["type", "question", "options", "answer"],
          },
        },
      },
    });

    const quiz = JSON.parse(response.text);
    return NextResponse.json({ quiz });

  } catch (err: any) {
    console.error("Error generating quiz:", err);
    return NextResponse.json({ error: "Failed to generate quiz" }, { status: 500 });
  }
}
