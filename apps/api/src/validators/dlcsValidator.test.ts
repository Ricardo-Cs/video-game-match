import { describe, expect, it } from "vitest";

import { dlcsValidator } from "./dlcsValidator";

describe("dlcsValidator", () => {
    it("aceita quando o jogo tem ao menos uma DLC", () => {
        expect(dlcsValidator([{ id: 1 }])).toBe(true);
    });

    it("recusa lista vazia", () => {
        expect(dlcsValidator([])).toBe(false);
    });

    it("recusa null", () => {
        expect(dlcsValidator(null)).toBe(false);
    });

    /**
     * Item A.3 da revisão: a IGDB omite a chave em vez de mandar null, então
     * "não tem DLC" e "a IGDB não sabe" são indistinguíveis aqui. O validator
     * trata os dois como "não tem" — comportamento atual, não ideal.
     */
    it("trata campo omitido como ausência de DLC", () => {
        expect(dlcsValidator(undefined)).toBe(false);
    });
});
