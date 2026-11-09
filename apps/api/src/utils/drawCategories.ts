import { GRID_SIZE, type Category } from "@vgm/contracts";
import { AppError } from "../errors/AppError";
import { isPlayableCell } from "./cellPlayability";
import { createSeededRandom, shuffle } from "./seededRandom";

// Conta, para cada grupo, quantos jogos atendem a todas as categorias do grupo ao mesmo tempo
export type CountAnswers = (groups: readonly (readonly Category[])[]) => Promise<number[]>;

// Linhas nunca se cruzam entre si (nem colunas): basta a categoria nova formar
// células jogáveis com cada categoria do eixo oposto
const formsPlayableCells = async (
    candidate: Category,
    opposite: readonly Category[],
    countAnswers: CountAnswers,
): Promise<boolean> => {
    if (opposite.length === 0) return true;

    const [candidateCount, ...counts] = await countAnswers([
        [candidate],
        ...opposite.map((category) => [category]),
        ...opposite.map((category) => [candidate, category]),
    ]);
    const oppositeCounts = counts.slice(0, opposite.length);
    const cellCounts = counts.slice(opposite.length);

    return opposite.every((_category, index) =>
        isPlayableCell({ cell: cellCounts[index], row: candidateCount, column: oppositeCounts[index] }),
    );
};

// Tenta primeiro o eixo mais vazio, para que linhas e colunas cresçam juntas e
// cada candidata seja conferida cedo, em vez de três linhas sem nenhuma checagem
const axesInTryOrder = (rows: Category[], columns: Category[]) =>
    rows.length <= columns.length
        ? [{ axis: rows, opposite: columns }, { axis: columns, opposite: rows }]
        : [{ axis: columns, opposite: rows }, { axis: rows, opposite: columns }];

const isGridComplete = (rows: Category[], columns: Category[]) =>
    rows.length === GRID_SIZE && columns.length === GRID_SIZE;

// Mesma seed e mesmas contagens, mesma grade: o puzzle diário e a depuração dependem disso
export const drawCategories = async (
    catalog: readonly Category[],
    seed: string,
    countAnswers: CountAnswers,
): Promise<Category[]> => {
    const rows: Category[] = [];
    const columns: Category[] = [];

    for (const candidate of shuffle(catalog, createSeededRandom(seed))) {
        if (isGridComplete(rows, columns)) break;

        for (const { axis, opposite } of axesInTryOrder(rows, columns)) {
            if (axis.length < GRID_SIZE && (await formsPlayableCells(candidate, opposite, countAnswers))) {
                axis.push(candidate);
                break;
            }
        }
    }

    if (!isGridComplete(rows, columns)) {
        throw new AppError("Não foi possível montar uma grade com resposta em todas as células.");
    }

    return [...rows, ...columns];
};
