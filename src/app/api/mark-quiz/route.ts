import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/supabase/server";
import { getGenAIService, type AnswerToMark } from "@/lib/services";
import { getQuizRepository } from "@/lib/repositories";

export async function POST(req: Request) {
  try {
    const user = await getAuthenticatedUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { quiz_id, answers, time_taken } = body;

    if (!quiz_id || !answers || !Array.isArray(answers)) {
      return NextResponse.json(
        { error: "Missing required fields: quiz_id, answers" },
        { status: 400 }
      );
    }

    const repository = getQuizRepository();

    const quiz = await repository.getQuizById(quiz_id);
    if (!quiz) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }

    const questions = await repository.getQuestionsByQuizId(quiz_id);
    if (questions.length === 0) {
      return NextResponse.json({ error: "Questions not found" }, { status: 404 });
    }

    const answersToMark: AnswerToMark[] = answers.map(
      (ans: { question_id: string; user_answer?: string }) => {
        const question = questions.find((q) => q.id === ans.question_id);
        if (!question) {
          throw new Error(`Question ${ans.question_id} not found`);
        }

        return {
          question_id: ans.question_id,
          question_text: question.question_text,
          question_type: question.type,
          user_answer: ans.user_answer || "",
          correct_answer: question.answer || "",
          marks_possible: question.marks || 1,
          explanation: question.explanation || undefined,
        };
      }
    );

    const genAIService = getGenAIService();
    const markingResult = await genAIService.markAnswers(answersToMark);

    const attempt = await repository.saveAttempt({
      user_id: user.id,
      quiz_id: quiz_id,
      score: markingResult.percentage,
      total_marks: markingResult.total_marks_possible,
      marks_obtained: markingResult.total_marks_awarded,
      feedback: { overall: markingResult.overall_feedback },
      time_taken: time_taken || null,
    });

    const attemptAnswers = markingResult.question_results.map((result) => ({
      attempt_id: attempt.id,
      question_id: result.question_id,
      user_answer:
        answers.find(
          (a: { question_id: string; user_answer?: string }) => a.question_id === result.question_id
        )?.user_answer || null,
      is_correct: result.is_correct,
      correctness_status: result.correctness_status,
      marks_awarded: result.marks_awarded,
      marks_possible: result.marks_possible,
      ai_feedback: result.feedback,
    }));

    await repository.saveAttemptAnswers(attemptAnswers);
    await repository.updateQuizStatus(quiz_id, user.id, "completed");

    return NextResponse.json({
      success: true,
      attempt_id: attempt.id,
      score: markingResult.percentage,
      total_marks_possible: markingResult.total_marks_possible,
      total_marks_awarded: markingResult.total_marks_awarded,
      overall_feedback: markingResult.overall_feedback,
      question_results: markingResult.question_results,
    });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Failed to mark quiz";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
