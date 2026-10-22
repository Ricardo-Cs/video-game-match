import { describe, expect, it, vi } from "vitest";

import { AppError } from "../errors/AppError";
import { buildGameByIdQuery, buildSearchQuery, sanitizeSearch } from "./igdb";

vi.mock("../config/env", () => ({
    env: {
        GAME_API_BASE_URL: "https://api.igdb.test/v4",
        TWITCH_AUTH_URL: "https://id.twitch.test/oauth2/token",
        CLIENT_ID: "client-id",
        CLIENT_SECRET: "client-secret",
        PORT: 3333,
    },
}));

describe("sanitizeSearch", () => {
    it("mantém nomes de jogo comuns, inclusive com apóstrofo e dois-pontos", () => {
        expect(sanitizeSearch("Baldur's Gate 3")).toBe("Baldur's Gate 3");
        expect(sanitizeSearch("The Witcher 3: Wild Hunt")).toBe("The Witcher 3: Wild Hunt");
    });

    it("remove aspas e barras invertidas", () => {
        expect(sanitizeSearch('zelda"; fields *; where id > 0; "')).toBe("zelda; fields *; where id > 0;");
        expect(sanitizeSearch("mario\\")).toBe("mario");
    });
});

describe("buildSearchQuery", () => {
    /**
     * Sem o sanitize, a aspa fecharia a string do `search` e o resto do termo
     * viraria cláusula da query (ex.: trocar os campos ou o filtro de tipo).
     */
    it("não deixa o termo escapar da string do search", () => {
        const query = buildSearchQuery('zelda"; fields *; where id > 0; "');

        expect(query.startsWith('search "zelda; fields *; where id > 0;"; fields id, name')).toBe(true);
        expect(query.match(/"/g)).toHaveLength(2);
    });
});

describe("buildGameByIdQuery", () => {
    it("monta a query com o id numérico", () => {
        expect(buildGameByIdQuery(1942)).toMatch(/where id = 1942;$/);
    });

    it.each([0, -1, 1.5, Number.NaN, Number.MAX_SAFE_INTEGER + 1])("recusa id inválido: %s", (id) => {
        expect(() => buildGameByIdQuery(id)).toThrow(AppError);
    });
});
