import { NextResponse } from "next/server";
import { GoogleGenAI, Type } from "@google/genai";
import { createServerSupabaseClient } from "@/lib/supabase/server";

const client = new GoogleGenAI({
  apiKey: process.env.GOOGLE_API_KEY || "",
});

interface AnswerToMark {
  question_id: string;
  question_text: string;
  question_type: "mcq" | "fill" | "truefalse" | "shortanswer" | "essay";
  user_answer: string;
  correct_answer: string;
  marks_possible: number;
  explanation?: string;
}

interface MarkingResult {
  question_id: string;
  is_correct: boolean;
  correctness_status: 'correct' | 'partial' | 'incorrect';
  marks_awarded: number;
  marks_possible: number;
  feedback: string;
}

interface AIMarkingResponse {
  overall_feedback: string;
  total_marks_possible: number;
  total_marks_awarded: number;
  percentage: number;
  question_results: MarkingResult[];
}

async function markAnswersWithAI(
  answers: AnswerToMark[]
): Promise<AIMarkingResponse> {
  // Separate auto-markable and manual questions
  const autoMarkable = answers.filter(
    (a) => a.question_type === "mcq" || a.question_type === "truefalse" || a.question_type === "fill"
  );
  const manualMark = answers.filter(
    (a) => a.question_type === "shortanswer" || a.question_type === "essay"
  );

  const results: MarkingResult[] = [];

  // Auto-mark simple questions
  for (const answer of autoMarkable) {
    const userAnswer = answer.user_answer?.trim().toLowerCase() || "";
    const correctAnswer = answer.correct_answer?.trim().toLowerCase() || "";
    const isCorrect = userAnswer === correctAnswer;

    results.push({
      question_id: answer.question_id,
      is_correct: isCorrect,
      correctness_status: isCorrect ? 'correct' : 'incorrect',
      marks_awarded: isCorrect ? answer.marks_possible : 0,
      marks_possible: answer.marks_possible,
      feedback: isCorrect
        ? "Correct! Well done."
        : `Incorrect. The correct answer is: ${answer.correct_answer}`,
    });
  }

  // Use AI to mark essay and short answer questions
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
      const response = await client.models.generateContent({
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

      // Process AI results
      aiResult.marked_answers.forEach((marked) => {
        const question = manualMark[marked.question_index];
        if (!question) {
          console.error(`Invalid question index: ${marked.question_index}`);
          return;
        }

        const marksAwarded = Math.min(
          Math.max(0, marked.marks_awarded),
          question.marks_possible
        );
        
        // Determine correctness status based on marks awarded
        let correctnessStatus: 'correct' | 'partial' | 'incorrect';
        if (marksAwarded >= question.marks_possible) {
          correctnessStatus = 'correct';
        } else if (marksAwarded > 0) {
          correctnessStatus = 'partial';
        } else {
          correctnessStatus = 'incorrect';
        }

        const isCorrect = correctnessStatus === 'correct';

        results.push({
          question_id: question.question_id,
          is_correct: isCorrect,
          correctness_status: correctnessStatus,
          marks_awarded: Math.round(marksAwarded * 100) / 100,
          marks_possible: question.marks_possible,
          feedback: marked.feedback || "Answer received.",
        });
      });
    } catch (error) {
      console.error("AI Marking Error:", error);
      
      // Enhanced fallback without ellipsis
      manualMark.forEach((question) => {
        const userAnswer = question.user_answer?.trim() || "";
        const correctAnswer = question.correct_answer?.trim().toLowerCase() || "";
        const userAnswerLower = userAnswer.toLowerCase();
        
        let marksAwarded = 0;
        let feedback = "";
        let correctnessStatus: 'correct' | 'partial' | 'incorrect' = 'incorrect';

        if (!userAnswer) {
          marksAwarded = 0;
          feedback = "No answer provided.";
          correctnessStatus = 'incorrect';
        } else {
          // Simple keyword matching for partial credit
          const correctWords = correctAnswer.split(/\s+/).filter(w => w.length > 3);
          const userWords = userAnswerLower.split(/\s+/);
          const matchingWords = correctWords.filter(word => 
            userWords.some(uw => uw.includes(word) || word.includes(uw))
          );
          
          const matchRatio = correctWords.length > 0 
            ? matchingWords.length / correctWords.length 
            : 0;

          // Award marks based on keyword matching
          if (matchRatio >= 0.8) {
            marksAwarded = question.marks_possible * 0.9;
            feedback = "Your answer covers most of the key points and demonstrates a strong understanding of the material. Well done! You have clearly explained the main concepts with relevant details and examples.";
            correctnessStatus = marksAwarded >= question.marks_possible ? 'correct' : 'partial';
          } else if (matchRatio >= 0.6) {
            marksAwarded = question.marks_possible * 0.7;
            feedback = "Your answer includes several correct elements and shows good understanding of the topic. To improve your score, consider adding more detail and depth to your explanation. Make sure to address all aspects of the question and provide specific examples where relevant.";
            correctnessStatus = 'partial';
          } else if (matchRatio >= 0.4) {
            marksAwarded = question.marks_possible * 0.5;
            feedback = "Your answer touches on some relevant points but needs more development and depth. You have identified some key ideas, but the explanation could be more thorough and comprehensive. Review the material carefully and ensure you understand the core concepts before attempting similar questions.";
            correctnessStatus = 'partial';
          } else if (matchRatio >= 0.2) {
            marksAwarded = question.marks_possible * 0.3;
            feedback = "Your answer shows some basic understanding but is missing several key elements and lacks sufficient detail. The response needs significant improvement in both content and explanation. I recommend reviewing the correct answer carefully and identifying which important concepts you missed in your response.";
            correctnessStatus = 'partial';
          } else {
            marksAwarded = question.marks_possible * 0.1;
            feedback = "Your answer does not adequately address the question and is missing most of the key concepts required for a complete response. Please review the material thoroughly and focus on understanding the fundamental principles. Take time to study the correct answer and identify what information was expected in a comprehensive response.";
            correctnessStatus = marksAwarded > 0 ? 'partial' : 'incorrect';
          }
        }

        results.push({
          question_id: question.question_id,
          is_correct: correctnessStatus === 'correct',
          correctness_status: correctnessStatus,
          marks_awarded: Math.round(marksAwarded * 100) / 100,
          marks_possible: question.marks_possible,
          feedback: feedback,
        });
      });
    }
  }

  // Calculate totals
  const totalMarksAwarded = results.reduce((sum, r) => sum + r.marks_awarded, 0);
  const totalMarksPossible = results.reduce((sum, r) => sum + r.marks_possible, 0);
  const percentage = totalMarksPossible > 0 
    ? (totalMarksAwarded / totalMarksPossible) * 100 
    : 0;

  // Generate overall feedback
  let overallFeedback = "";
  if (percentage >= 90) {
    overallFeedback = "Outstanding work! You demonstrated excellent understanding of the material with comprehensive and well-structured answers.";
  } else if (percentage >= 75) {
    overallFeedback = "Great job! You showed strong comprehension of the key concepts. Review the feedback for areas where you can further strengthen your understanding.";
  } else if (percentage >= 60) {
    overallFeedback = "Good effort! You are on the right track and understand several important concepts. Focus on the feedback provided to fill in the gaps and deepen your knowledge.";
  } else if (percentage >= 50) {
    overallFeedback = "You are making progress and have grasped some basic concepts. Take time to review the material thoroughly and focus on the areas highlighted in the feedback to improve your understanding.";
  } else {
    overallFeedback = "Keep studying and do not give up! Review the correct answers carefully and try to understand the underlying concepts. The feedback provided will help guide your learning. Consider reviewing the material again before your next attempt.";
  }

  return {
    overall_feedback: overallFeedback,
    total_marks_possible: totalMarksPossible,
    total_marks_awarded: totalMarksAwarded,
    percentage: Math.round(percentage * 100) / 100,
    question_results: results,
  };
}

export async function POST(req: Request) {
  try {
    const supabase = await createServerSupabaseClient();

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
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

    // Fetch quiz and questions
    const { data: quiz, error: quizError } = await supabase
      .from("quizzes")
      .select("*")
      .eq("id", quiz_id)
      .single();

    if (quizError || !quiz) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }

    const { data: questions, error: questionsError } = await supabase
      .from("questions")
      .select("*")
      .eq("quiz_id", quiz_id);

    if (questionsError || !questions) {
      return NextResponse.json(
        { error: "Questions not found" },
        { status: 404 }
      );
    }

    // Prepare answers for marking
    const answersToMark: AnswerToMark[] = answers.map((ans: { question_id: string; user_answer?: string }) => {
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
    });

    // Mark answers with AI
    const markingResult = await markAnswersWithAI(answersToMark);

    // Save attempt to database
    const { data: attempt, error: attemptError } = await supabase
      .from("attempts")
      .insert({
        user_id: user.id,
        quiz_id: quiz_id,
        score: markingResult.percentage,
        total_marks: markingResult.total_marks_possible,
        marks_obtained: markingResult.total_marks_awarded,
        feedback: { overall: markingResult.overall_feedback },
        time_taken: time_taken || null,
      })
      .select()
      .single();

    if (attemptError || !attempt) {
      console.error("Error saving attempt:", attemptError);
      return NextResponse.json(
        { error: "Failed to save attempt" },
        { status: 500 }
      );
    }

    // Save individual answer results with correctness_status
    const attemptAnswers = markingResult.question_results.map((result) => ({
      attempt_id: attempt.id,
      question_id: result.question_id,
      user_answer: answers.find((a: { question_id: string; user_answer?: string }) => a.question_id === result.question_id)
        ?.user_answer || null,
      is_correct: result.is_correct,
      correctness_status: result.correctness_status,
      marks_awarded: result.marks_awarded,
      marks_possible: result.marks_possible,
      ai_feedback: result.feedback,
    }));

    const { error: answersError } = await supabase
      .from("attempt_answers")
      .insert(attemptAnswers);

    if (answersError) {
      console.error("Error saving attempt answers:", answersError);
      // Don't fail the whole request, attempt is already saved
    }

    // Update quiz status to completed
    await supabase
      .from("quizzes")
      .update({ status: "completed" })
      .eq("id", quiz_id)
      .eq("user_id", user.id);

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
    console.error("Error marking quiz:", err);
    const errorMessage = err instanceof Error ? err.message : "Failed to mark quiz";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
