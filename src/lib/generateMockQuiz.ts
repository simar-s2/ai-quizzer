export function generateMockQuiz(text: string) {
  return [
    {
      type: "mcq",
      question: "What is the capital of France?",
      options: ["Paris", "London", "Berlin", "Madrid"],
      answer: "Paris",
      topic: "Geography",
    },
    {
      type: "fill",
      question: "The process by which plants make food is called ____.",
      answer: "photosynthesis",
      topic: "Biology",
    },
    {
      type: "truefalse",
      question: "The Earth revolves around the Moon.",
      answer: "False",
      topic: "Astronomy",
    },
    {
      type: "shortanswer",
      question: "What is the main function of the mitochondria in a cell?",
      answer: "Mitochondria are the powerhouses of the cell, responsible for generating energy through cellular respiration.",
      topic: "Biology",
    },
    {
      type: "essay",
      question: "Describe the main differences between a prokaryotic cell and a eukaryotic cell.",
      answer: "Prokaryotic cells lack a true nucleus and other membrane-bound organelles, whereas eukaryotic cells have a true nucleus and other membrane-bound organelles.",
      topic: "Biology",
    },
  ];
}