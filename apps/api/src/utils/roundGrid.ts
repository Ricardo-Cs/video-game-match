import { GRID_SIZE, type Category, type CellIndex } from "@vgm/contracts";

export const CATEGORIES_PER_ROUND = GRID_SIZE * 2;

// As categorias da rodada ficam em uma lista só: primeiro as linhas, depois as colunas
export const splitIntoRowsAndColumns = <T>(categories: readonly T[]) => ({
    rows: categories.slice(0, GRID_SIZE),
    columns: categories.slice(GRID_SIZE, CATEGORIES_PER_ROUND),
});

export const categoriesOfCell = (categories: readonly Category[], cell: CellIndex): [Category, Category] => {
    const { rows, columns } = splitIntoRowsAndColumns(categories);
    const row = rows[Math.floor(cell / GRID_SIZE)];
    const column = columns[cell % GRID_SIZE];
    return [row, column];
};
