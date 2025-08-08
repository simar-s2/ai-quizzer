type QuizQuestion = {
  type: "mcq" | "fill" | "truefalse" | "shortanswer" | "essay";
  question: string;
  options?: string[];
  answer: string;
  topic: string;
};

export default QuizQuestion;