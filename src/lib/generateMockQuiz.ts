export function generateMockQuiz(text: string) {
    return [
        {
            type: "mcq",
            question: "What is the capital of France?",
            options: ["Paris", "London", "Berlin", "Madrid"],
            answer: "Paris",
          },
          {
            type: "fill",
            question: "The process by which plants make food is called ____.",
            answer: "photosynthesis",
          },
          {
            type: "truefalse",
            question: "The Earth revolves around the Moon.",
            answer: "False",
          },
    ]
}