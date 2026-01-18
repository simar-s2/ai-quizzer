import type {
  IGenAIService,
  GenerateQuizParams,
  GenerateQuizResponse,
  AnswerToMark,
  MarkQuizResponse,
  MarkingResult,
  FileUploadResult,
} from "./types";

const MOCK_LATENCY_MS = 2000;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export class MockGenAIService implements IGenAIService {
  async uploadFile(_fileBlob: Blob, displayName: string): Promise<FileUploadResult> {
    await sleep(500);
    return {
      uri: `mock://files/${displayName}`,
      mimeType: "application/pdf",
    };
  }

  async generateQuiz(params: GenerateQuizParams): Promise<GenerateQuizResponse> {
    await sleep(MOCK_LATENCY_MS);

    const topic = params.topic || "General Knowledge";

    if (topic.toLowerCase() === "error") {
      throw new Error("Mock service error triggered for testing");
    }

    const difficulty = params.difficulty || "medium";
    const numQuestions = params.numQuestions || 5;
    const selectedTypes = params.type?.selectedTypes || ["mcq", "fill", "truefalse", "shortanswer", "essay"];
    const distribution = params.type?.distribution || {};

    const questions = this.generateMockQuestions(numQuestions, selectedTypes, distribution);

    return {
      quiz: {
        title: `${topic} Quiz`,
        description: `A ${difficulty} level quiz covering ${topic} concepts.`,
        subject: topic,
        tags: [topic.toLowerCase(), difficulty, "mock"],
        difficulty: difficulty,
      },
      questions: questions,
    };
  }

  async markAnswers(answers: AnswerToMark[]): Promise<MarkQuizResponse> {
    await sleep(MOCK_LATENCY_MS);

    const results: MarkingResult[] = answers.map((answer) => {
      if (answer.question_type === "mcq" || answer.question_type === "truefalse" || answer.question_type === "fill") {
        const userAnswer = answer.user_answer?.trim().toLowerCase() || "";
        const correctAnswer = answer.correct_answer?.trim().toLowerCase() || "";
        const isCorrect = userAnswer === correctAnswer;

        return {
          question_id: answer.question_id,
          is_correct: isCorrect,
          correctness_status: isCorrect ? "correct" as const : "incorrect" as const,
          marks_awarded: isCorrect ? answer.marks_possible : 0,
          marks_possible: answer.marks_possible,
          feedback: isCorrect
            ? "Correct! Well done."
            : `Incorrect. The correct answer is: ${answer.correct_answer}`,
        };
      }

      const userAnswer = answer.user_answer?.trim() || "";
      if (!userAnswer) {
        return {
          question_id: answer.question_id,
          is_correct: false,
          correctness_status: "incorrect" as const,
          marks_awarded: 0,
          marks_possible: answer.marks_possible,
          feedback: "No answer provided.",
        };
      }

      const wordCount = userAnswer.split(/\s+/).length;
      let marksAwarded: number;
      let correctnessStatus: "correct" | "partial" | "incorrect";
      let feedback: string;

      if (wordCount >= 50) {
        marksAwarded = answer.marks_possible * 0.9;
        correctnessStatus = "partial";
        feedback = "Your answer is comprehensive and covers the key points well. You have demonstrated a strong understanding of the topic with relevant details and examples.";
      } else if (wordCount >= 25) {
        marksAwarded = answer.marks_possible * 0.7;
        correctnessStatus = "partial";
        feedback = "Your answer addresses the main concepts but could benefit from more detail and depth. Consider expanding on your explanations with specific examples.";
      } else if (wordCount >= 10) {
        marksAwarded = answer.marks_possible * 0.5;
        correctnessStatus = "partial";
        feedback = "Your answer touches on some relevant points but needs more development. Try to provide a more thorough explanation that covers all aspects of the question.";
      } else {
        marksAwarded = answer.marks_possible * 0.2;
        correctnessStatus = "partial";
        feedback = "Your answer is too brief to fully address the question. Please provide a more detailed response that demonstrates your understanding of the topic.";
      }

      return {
        question_id: answer.question_id,
        is_correct: false,
        correctness_status: correctnessStatus,
        marks_awarded: Math.round(marksAwarded * 100) / 100,
        marks_possible: answer.marks_possible,
        feedback: feedback,
      };
    });

    const totalMarksAwarded = results.reduce((sum, r) => sum + r.marks_awarded, 0);
    const totalMarksPossible = results.reduce((sum, r) => sum + r.marks_possible, 0);
    const percentage = totalMarksPossible > 0 ? (totalMarksAwarded / totalMarksPossible) * 100 : 0;

    let overallFeedback: string;
    if (percentage >= 90) {
      overallFeedback = "Outstanding work! You demonstrated excellent understanding of the material.";
    } else if (percentage >= 75) {
      overallFeedback = "Great job! You showed strong comprehension of the key concepts.";
    } else if (percentage >= 60) {
      overallFeedback = "Good effort! You understand several important concepts. Review the feedback to improve.";
    } else if (percentage >= 50) {
      overallFeedback = "You have grasped some basic concepts. Focus on the areas highlighted in the feedback.";
    } else {
      overallFeedback = "Keep studying! Review the correct answers carefully and try again.";
    }

    return {
      overall_feedback: overallFeedback,
      total_marks_possible: totalMarksPossible,
      total_marks_awarded: Math.round(totalMarksAwarded * 100) / 100,
      percentage: Math.round(percentage * 100) / 100,
      question_results: results,
    };
  }

  private generateMockQuestions(
    numQuestions: number,
    selectedTypes: string[],
    distribution: Record<string, number>
  ): GenerateQuizResponse["questions"] {
    const questionBank = [
      {
        type: "mcq" as const,
        question_text: "What is the capital of France?",
        options: ["Paris", "London", "Berlin", "Madrid"],
        answer: "Paris",
        explanation: "Paris has been the capital of France since the 10th century.",
        marks: 1,
      },
      {
        type: "mcq" as const,
        question_text: "Which planet is known as the Red Planet?",
        options: ["Venus", "Mars", "Jupiter", "Saturn"],
        answer: "Mars",
        explanation: "Mars appears red due to iron oxide (rust) on its surface.",
        marks: 1,
      },
      {
        type: "fill" as const,
        question_text: "The process by which plants make food is called ____.",
        answer: "photosynthesis",
        explanation: "Photosynthesis converts sunlight, water, and carbon dioxide into glucose and oxygen.",
        marks: 1,
      },
      {
        type: "fill" as const,
        question_text: "Water is composed of hydrogen and ____.",
        answer: "oxygen",
        explanation: "Water (H2O) consists of two hydrogen atoms and one oxygen atom.",
        marks: 1,
      },
      {
        type: "truefalse" as const,
        question_text: "The Earth revolves around the Moon.",
        answer: "False",
        explanation: "The Moon revolves around the Earth, not the other way around.",
        marks: 1,
      },
      {
        type: "truefalse" as const,
        question_text: "The speed of light is approximately 300,000 kilometers per second.",
        answer: "True",
        explanation: "Light travels at approximately 299,792 km/s in a vacuum.",
        marks: 1,
      },
      {
        type: "shortanswer" as const,
        question_text: "What is the main function of the mitochondria in a cell?",
        answer: "Mitochondria are the powerhouses of the cell, responsible for generating energy through cellular respiration by producing ATP.",
        explanation: "Mitochondria convert nutrients into adenosine triphosphate (ATP) through oxidative phosphorylation.",
        marks: 2,
      },
      {
        type: "shortanswer" as const,
        question_text: "Explain Newton's First Law of Motion.",
        answer: "An object at rest stays at rest and an object in motion stays in motion with the same speed and direction unless acted upon by an external force.",
        explanation: "This is also known as the law of inertia.",
        marks: 2,
      },
      {
        type: "essay" as const,
        question_text: "Describe the main differences between prokaryotic and eukaryotic cells.",
        answer: "Prokaryotic cells lack a true nucleus and membrane-bound organelles, have smaller ribosomes, and typically have circular DNA. Eukaryotic cells have a membrane-bound nucleus, various organelles like mitochondria and endoplasmic reticulum, larger ribosomes, and linear chromosomes. Prokaryotes are generally smaller and simpler, while eukaryotes are larger and more complex.",
        explanation: "Understanding cell structure is fundamental to biology.",
        marks: 5,
      },
      {
        type: "essay" as const,
        question_text: "Discuss the causes and effects of climate change.",
        answer: "Climate change is primarily caused by human activities including burning fossil fuels, deforestation, and industrial processes that release greenhouse gases. Effects include rising global temperatures, melting ice caps, sea level rise, extreme weather events, biodiversity loss, and impacts on agriculture and human health.",
        explanation: "Climate change is one of the most pressing environmental issues.",
        marks: 5,
      },
    ];

    const filteredBank = questionBank.filter((q) => selectedTypes.includes(q.type));

    if (filteredBank.length === 0) {
      return questionBank.slice(0, numQuestions);
    }

    const questions: GenerateQuizResponse["questions"] = [];
    const hasDistribution = Object.keys(distribution).length > 0;

    if (hasDistribution) {
      for (const [type, count] of Object.entries(distribution)) {
        const typeQuestions = filteredBank.filter((q) => q.type === type);
        for (let i = 0; i < count && questions.length < numQuestions; i++) {
          if (typeQuestions.length > 0) {
            questions.push(typeQuestions[i % typeQuestions.length]);
          }
        }
      }
    }

    while (questions.length < numQuestions) {
      const idx = questions.length % filteredBank.length;
      questions.push(filteredBank[idx]);
    }

    return questions.slice(0, numQuestions);
  }
}
