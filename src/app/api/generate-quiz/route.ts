import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/supabase/server";
import { getGenAIService, type GenerateQuizParams } from "@/lib/services";

export async function POST(req: Request) {
  try {
    const user = await getAuthenticatedUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const contentType = req.headers.get("content-type") || "";
    const genAIService = getGenAIService();

    let generateParams: GenerateQuizParams;

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const files = formData.getAll("files") as File[];
      const settings = formData.get("settings")?.toString() || "{}";
      const settingsJson = JSON.parse(settings);

      if (!files || files.length === 0) {
        return NextResponse.json({ error: "No files uploaded" }, { status: 400 });
      }

      const uploadedFiles: { uri: string; mimeType: string }[] = [];

      for (const file of files) {
        const buffer = await file.arrayBuffer();
        const blob = new Blob([buffer], { type: "application/pdf" });
        const uploaded = await genAIService.uploadFile(blob, file.name);
        uploadedFiles.push(uploaded);
      }

      generateParams = {
        files: uploadedFiles,
        ...settingsJson,
      };
    } else {
      const { text, settings } = await req.json();
      generateParams = { text, ...settings };
    }

    const geminiResponse = await genAIService.generateQuiz(generateParams);

    const totalMarks = geminiResponse.questions.reduce((sum, q) => sum + (q.marks || 1), 0);

    return NextResponse.json({
      quiz: {
        ...geminiResponse.quiz,
        total_marks: totalMarks,
        user_id: user.id,
        status: "not_started",
        visibility: "private",
      },
      questions: geminiResponse.questions.map((q) => ({
        ...q,
        marks: q.marks || 1,
        visibility: "private",
      })),
      message: "Quiz generated successfully",
    });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Failed to generate quiz";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
