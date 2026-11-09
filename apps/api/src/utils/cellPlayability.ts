// Menos que isso e a célula vira adivinhação (ex.: Jogo do Ano × PS3 só aceita Dragon Age: Inquisition)
export const MIN_ANSWERS_PER_CELL = 3;

export interface CellAnswerCounts {
    cell: number;
    row: number;
    column: number;
}

// Quando a célula tem tantas respostas quanto uma das categorias sozinha, uma implica
// a outra (Coop × Multiplayer, PS2 × 6ª geração) e a célula não pede nada além da outra
const isOneCategoryImpliedByTheOther = ({ cell, row, column }: CellAnswerCounts): boolean =>
    cell >= row || cell >= column;

export const isPlayableCell = (counts: CellAnswerCounts): boolean =>
    counts.cell >= MIN_ANSWERS_PER_CELL && !isOneCategoryImpliedByTheOther(counts);
