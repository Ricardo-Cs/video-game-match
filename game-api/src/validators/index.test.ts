import { beforeEach, describe, expect, it, vi } from "vitest";

import { Category, GameCheckApiResponse, answerData } from "../types/types";
import { awardValidator } from "./awardValidator";
import { checkAnswer } from "./index";

// O awardValidator é o único que vai ao banco; aqui só interessa se o
// checkAnswer roteia para ele e aguarda o resultado.
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

const category = (type: string, operator: string, value: string | number): Category => ({
    name: `categoria ${type}`,
    type,
    condition: { field: type, operator, value },
});

const answer = (...categories: Category[]): answerData => ({
    id: String(GAME.id),
    categories,
});

beforeEach(() => {
    vi.resetAllMocks();
});

describe("checkAnswer", () => {
    it("aceita quando todas as categorias batem e devolve a capa", async () => {
        const result = await checkAnswer(
            GAME,
            answer(
                category("genre", "includes", "Role-playing (RPG)"),
                category("platform", "includes", "PC (Microsoft Windows)"),
                category("releaseYear", "<", 2020),
                category("dlcs", "includes", "dlcs"),
            ),
        );

        expect(result).toEqual({ answer: true, image: "//images.igdb.com/capa.jpg" });
    });

    it("recusa se uma única categoria falha", async () => {
        const result = await checkAnswer(
            GAME,
            answer(
                category("genre", "includes", "Role-playing (RPG)"),
                category("genre", "includes", "Puzzle"),
            ),
        );

        expect(result).toEqual({ answer: false, message: "Resposta incorreta!" });
    });

    it("devolve image null quando a IGDB não trouxe capa", async () => {
        const { cover: _cover, ...semCapa } = GAME;

        const result = await checkAnswer(semCapa, answer(category("genre", "includes", "Role-playing (RPG)")));

        expect(result).toEqual({ answer: true, image: null });
    });

    it("converte first_release_date (epoch em segundos) para ano", async () => {
        await expect(
            checkAnswer(GAME, answer(category("releaseYear", ">=", 2015))),
        ).resolves.toMatchObject({ answer: true });

        await expect(
            checkAnswer(GAME, answer(category("releaseYear", ">", 2015))),
        ).resolves.toMatchObject({ answer: false });
    });

    it("recusa releaseYear quando a IGDB omitiu a data", async () => {
        const { first_release_date: _date, ...semData } = GAME;

        await expect(
            checkAnswer(semData, answer(category("releaseYear", "<", 2020))),
        ).resolves.toMatchObject({ answer: false });
    });

    it("aguarda o awardValidator, que é assíncrono", async () => {
        mockedAwardValidator.mockResolvedValue(true);

        const result = await checkAnswer(GAME, answer(category("award", "includes", "Game Of The Year")));

        expect(mockedAwardValidator).toHaveBeenCalledWith(GAME.name, "Game Of The Year");
        expect(result).toMatchObject({ answer: true });
    });

    /**
     * Item 5 da revisão: `category.type` é z.string() livre e o switch tem
     * `default: return false`. Um tipo escrito errado vira "resposta
     * incorreta" sem log nenhum — o jogador perde a rodada por bug nosso.
     */
    it("trata tipo de categoria desconhecido como resposta errada, em silêncio", async () => {
        const result = await checkAnswer(GAME, answer(category("genero", "includes", "Role-playing (RPG)")));

        expect(result).toEqual({ answer: false, message: "Resposta incorreta!" });
    });

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
            checkAnswer(publicadoPelaNintendo, answer(category("company", "includes", "Nintendo"))),
        ).resolves.toMatchObject({ answer: true });
    });
});
