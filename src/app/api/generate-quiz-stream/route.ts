import { getAuthenticatedUser } from "@/lib/supabase/server";
import { getGenAIService } from "@/lib/services";
import { NextResponse } from "next/server";
import type { GenerateQuizParams } from "@/lib/services";

export const maxDuration = 60; // Vercel: allow up to 60s for streaming

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

      generateParams = { files: uploadedFiles, ...settingsJson };
    } else {
      const { text, settings } = await req.json();
      generateParams = { text, ...settings };
    }

    const stream = await genAIService.generateQuizStream(generateParams);

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Stream failed";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}