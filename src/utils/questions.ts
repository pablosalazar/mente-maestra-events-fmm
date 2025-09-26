import type { Question } from "@/types";

export function selectRandomItems<T>(array: T[], count: number): T[] {
  if (count >= array.length) {
    return [...array];
  }

  const shuffled = [...array].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

export function selectRandomQuestionIds(
  questions: Question[],
  count: number = 5
): string[] {
  const selectedQuestions = selectRandomItems(questions, count);
  return selectedQuestions.map((q) => q.id.toString());
}
