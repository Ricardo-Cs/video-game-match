import type { CategoryView, GuessResult } from '@vgm/contracts';

export interface GuessFeedback {
  isCorrect: boolean;
  message: string;
}

function joinCategoryNames(categories: readonly CategoryView[]) {
  return categories.map((category) => category.name).join(' nem a ');
}

export function buildGuessFeedback(
  gameName: string,
  { correct, unmetCategories }: Pick<GuessResult, 'correct' | 'unmetCategories'>,
  [row, column]: readonly [CategoryView, CategoryView],
): GuessFeedback {
  if (correct) {
    return { isCorrect: true, message: `Acertou! ${gameName} vale para ${row.name} × ${column.name}.` };
  }

  return { isCorrect: false, message: `${gameName} não atende a ${joinCategoryNames(unmetCategories)}.` };
}
