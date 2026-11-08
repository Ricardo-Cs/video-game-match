import type { Category } from "@vgm/contracts";
import { AppError } from "../errors/AppError";
import { CATEGORIES_PER_ROUND } from "./roundGrid";
import { createSeededRandom, shuffle } from "./seededRandom";

// Pares sem nenhum jogo que satisfaça os dois ao mesmo tempo. Paliativo até a
// checagem automática com /games/count da IGDB (Etapa 5 do ROADMAP).
const INCOMPATIBLE_CATEGORY_PAIRS: readonly (readonly [string, string])[] = [
    ["Jogo da Nintendo", "Jogo da From Software"],
    ["Jogo Indie", "Jogo da From Software"],
    ["Lançado depois de 1999", "Lançado antes de 1999"],
    ["Lançado em 2020 ou depois", "Lançado antes de 1999"],
    // Os prêmios do seed vão de 2014 a 2024, nenhum vencedor saiu no PS2 ou antes de 1999
    ["Vencedor de Melhor Jogo do Ano", "Jogo de PlayStation 2"],
    ["Vencedor de Melhor Jogo do Ano", "Lançado antes de 1999"],
    ["Vencedor de Melhor Jogo do Ano", "Jogo da Valve"],
    ["Vencedor de Melhor Jogo Indie", "Jogo de PlayStation 2"],
    ["Vencedor de Melhor Jogo Indie", "Lançado antes de 1999"],
    ["Vencedor de Melhor Jogo Indie", "Jogo da From Software"],
    ["Vencedor de Melhor Jogo Indie", "Jogo da Nintendo"],
    ["Vencedor de Melhor Jogo Indie", "Jogo da Valve"],
];

const areIncompatible = (first: Category, second: Category): boolean =>
    INCOMPATIBLE_CATEGORY_PAIRS.some(([one, other]) =>
        (one === first.name && other === second.name) || (one === second.name && other === first.name),
    );

const fitsAlongside = (selected: readonly Category[], candidate: Category): boolean =>
    selected.every((chosen) => chosen.name !== candidate.name && !areIncompatible(chosen, candidate));

export const drawCategories = (catalog: readonly Category[], seed: string): Category[] => {
    const selected: Category[] = [];

    for (const candidate of shuffle(catalog, createSeededRandom(seed))) {
        if (selected.length === CATEGORIES_PER_ROUND) break;
        if (fitsAlongside(selected, candidate)) selected.push(candidate);
    }

    if (selected.length < CATEGORIES_PER_ROUND) {
        throw new AppError(`O catálogo não tem ${CATEGORIES_PER_ROUND} categorias compatíveis entre si.`);
    }

    return selected;
};
