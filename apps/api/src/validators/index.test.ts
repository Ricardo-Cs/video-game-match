import { beforeEach, describe, expect, it, vi } from "vitest";

import { AppError } from "../errors/AppError";
import type { Category, CategoryType, ConditionOperator } from "@vgm/contracts";
import { GameCheckApiResponse } from "../types/types";
import { awardValidator } from "./awardValidator";
import { matchesAllCategories } from "./index";

// O awardValidator é o único que vai ao banco; aqui só interessa se o
// matchesAllCategories roteia para ele e aguarda o resultado.
vi.mock("./awardValidator", () => ({ awardValidator: vi.fn() }));

const mockedAwardValidator = vi.mocked(awardValidator);

const GAME: GameCheckApiResponse = {
    id: 1942,
    name: "The Witcher 3: Wild Hunt",
    first_release_date: 1431993600, // 2015-05-19
    genres: [{ id: 12, name: "Role-playing (RPG)" }],
    platforms: [{ id: 6, name: "PC (Microsoft Windows)" }],
    game_modes: [{ id: 1, name: "Single player" }],
    involved_companies: [{ id: 1, company: { id: 908, name: "CD Projekt RED" } }],
    dlcs: [{ id: 1 }],
    cover: { id: 5, url: "//images.igdb.com/capa.jpg" },
};

const category = (type: CategoryType, operator: ConditionOperator, value: string | number): Category => ({
    name: `categoria ${type}`,
    type,
    condition: { field: type, operator, value },
});

beforeEach(() => {
    vi.resetAllMocks();
});

describe("matchesAllCategories", () => {
    it("aceita quando todas as categorias batem", async () => {
        const result = await matchesAllCategories(GAME, [
            category("genre", "includes", "Role-playing (RPG)"),
            category("platform", "includes", "PC (Microsoft Windows)"),
            category("releaseYear", "<", 2020),
            category("dlcs", "includes", "dlcs"),
        ]);

        expect(result).toBe(true);
    });

    it("recusa se uma única categoria falha", async () => {
        const result = await matchesAllCategories(GAME, [
            category("genre", "includes", "Role-playing (RPG)"),
            category("genre", "includes", "Puzzle"),
        ]);

        expect(result).toBe(false);
    });

    it("converte first_release_date (epoch em segundos) para ano", async () => {
        await expect(
            matchesAllCategories(GAME, [category("releaseYear", ">=", 2015)]),
        ).resolves.toBe(true);

        await expect(
            matchesAllCategories(GAME, [category("releaseYear", ">", 2015)]),
        ).resolves.toBe(false);
    });

    it("recusa releaseYear quando a IGDB omitiu a data", async () => {
        const { first_release_date: _date, ...semData } = GAME;

        await expect(
            matchesAllCategories(semData, [category("releaseYear", "<", 2020)]),
        ).resolves.toBe(false);
    });

    it("aguarda o awardValidator, que é assíncrono", async () => {
        mockedAwardValidator.mockResolvedValue(true);

        const result = await matchesAllCategories(GAME, [category("award", "includes", "Game Of The Year")]);

        expect(mockedAwardValidator).toHaveBeenCalledWith(GAME.name, "Game Of The Year");
        expect(result).toBe(true);
    });

    // O z.enum barra tipo desconhecido na borda; se um chegar aqui, é bug nosso e deve falhar alto
    it.each(["genero", "toString", "constructor"])(
        "lança AppError para o tipo de categoria sem validador %j",
        async (unknownType) => {
            await expect(
                matchesAllCategories(GAME, [category(unknownType as CategoryType, "includes", "Role-playing (RPG)")]),
            ).rejects.toThrow(AppError);
        },
    );

    /**
     * Anexo A.2: involved_companies é achatado em nomes e os booleans
     * developer/publisher são descartados, então "Jogo da Nintendo" aceita um
     * jogo apenas publicado pela Nintendo.
     */
    it("não distingue desenvolvedora de publicadora", async () => {
        const publicadoPelaNintendo: GameCheckApiResponse = {
            ...GAME,
            involved_companies: [{ id: 2, company: { id: 70, name: "Nintendo" } }],
        };

        await expect(
            matchesAllCategories(publicadoPelaNintendo, [category("company", "includes", "Nintendo")]),
        ).resolves.toBe(true);
    });
});
