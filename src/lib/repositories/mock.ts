import type {
  Quiz,
  Question,
  Attempt,
  QuizInsert,
  QuestionInsert,
  AttemptInsert,
  AttemptAnswerInsert,
  QuizStatus,
} from "@/lib/supabase/client";
import type { IQuizRepository } from "./types";

function generateId(): string {
  return `mock-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

interface MockDataStore {
  quizzes: Map<string, Quiz>;
  questions: Map<string, Question>;
  attempts: Map<string, Attempt>;
  attemptAnswers: Map<string, AttemptAnswerInsert & { id: string }>;
}

const dataStore: MockDataStore = {
  quizzes: new Map(),
  questions: new Map(),
  attempts: new Map(),
  attemptAnswers: new Map(),
};

export class MockQuizRepository implements IQuizRepository {
  async getQuizById(quizId: string): Promise<Quiz | null> {
    return dataStore.quizzes.get(quizId) || null;
  }

  async getQuestionsByQuizId(quizId: string): Promise<Question[]> {
    const questions: Question[] = [];
    dataStore.questions.forEach((question) => {
      if (question.quiz_id === quizId) {
        questions.push(question);
      }
    });
    return questions.sort(
      (a, b) => new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime()
    );
  }

  async createQuiz(
    quiz: Omit<QuizInsert, "user_id">,
    questions: Omit<QuestionInsert, "quiz_id">[],
    userId: string
  ): Promise<string> {
    const quizId = generateId();
    const now = new Date().toISOString();

    const newQuiz: Quiz = {
      id: quizId,
      user_id: userId,
      title: quiz.title,
      description: quiz.description || null,
      subject: quiz.subject || null,
      difficulty: quiz.difficulty || "medium",
      tags: quiz.tags || null,
      status: quiz.status || "not_started",
      visibility: quiz.visibility || "private",
      total_marks: quiz.total_marks || null,
      total_time: quiz.total_time || null,
      metadata: quiz.metadata || null,
      created_at: now,
      updated_at: now,
    };

    dataStore.quizzes.set(quizId, newQuiz);

    questions.forEach((q, index) => {
      const questionId = generateId();
      const questionTime = new Date(Date.now() + index).toISOString();

      const newQuestion: Question = {
        id: questionId,
        quiz_id: quizId,
        question_text: q.question_text,
        type: q.type,
        options: q.options || null,
        answer: q.answer || null,
        explanation: q.explanation || null,
        marks: q.marks || 1,
        visibility: q.visibility || "private",
        created_at: questionTime,
        updated_at: questionTime,
      };

      dataStore.questions.set(questionId, newQuestion);
    });

    return quizId;
  }

  async updateQuizStatus(quizId: string, userId: string, status: QuizStatus): Promise<void> {
    const quiz = dataStore.quizzes.get(quizId);
    if (quiz && quiz.user_id === userId) {
      dataStore.quizzes.set(quizId, {
        ...quiz,
        status,
        updated_at: new Date().toISOString(),
      });
    }
  }

  async saveAttempt(attempt: AttemptInsert): Promise<Attempt> {
    const attemptId = generateId();
    const now = new Date().toISOString();

    const newAttempt: Attempt = {
      id: attemptId,
      user_id: attempt.user_id || null,
      quiz_id: attempt.quiz_id || null,
      score: attempt.score,
      total_marks: attempt.total_marks,
      marks_obtained: attempt.marks_obtained,
      feedback: attempt.feedback || null,
      time_taken: attempt.time_taken || null,
      completed_at: now,
      created_at: now,
      updated_at: now,
    };

    dataStore.attempts.set(attemptId, newAttempt);
    return newAttempt;
  }

  async saveAttemptAnswers(answers: AttemptAnswerInsert[]): Promise<void> {
    answers.forEach((answer) => {
      const answerId = generateId();
      dataStore.attemptAnswers.set(answerId, {
        ...answer,
        id: answerId,
      });
    });
  }
}

export function clearMockDataStore(): void {
  dataStore.quizzes.clear();
  dataStore.questions.clear();
  dataStore.attempts.clear();
  dataStore.attemptAnswers.clear();
}

export function getMockDataStore(): MockDataStore {
  return dataStore;
}
