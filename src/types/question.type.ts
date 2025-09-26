export type Question = {
  id: string;
  topic: string;
  question: string;
  options: QuestionOption;
  answer: string;
};

export type QuestionOption = {
  A: string;
  B: string;
  C: string;
  D: string;
};
