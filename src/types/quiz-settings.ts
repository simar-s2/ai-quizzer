export interface QuizSettingsType {
  difficulty: string;
  numQuestions: number;
  topic: string;
  type: {
    selectedTypes: string[];
    distribution: {
      mcq: number;
      fill: number;
      truefalse: number;
      shortanswer: number;
      essay: number;
    };
  };
}
