import { describe, expect, it } from "vitest";

import { createSeededRandom, shuffle } from "./seededRandom";

const takeNumbers = (seed: string, amount: number) => {
    const random = createSeededRandom(seed);
    return Array.from({ length: amount }, random);
};

describe("createSeededRandom", () => {
    it("repete a mesma sequência para a mesma seed", () => {
        expect(takeNumbers("grade-do-dia", 50)).toEqual(takeNumbers("grade-do-dia", 50));
    });

    it("produz sequências diferentes para seeds diferentes", () => {
        expect(takeNumbers("seed-a", 10)).not.toEqual(takeNumbers("seed-b", 10));
    });

    it("gera números no intervalo [0, 1)", () => {
        for (const number of takeNumbers("intervalo", 10_000)) {
            expect(number).toBeGreaterThanOrEqual(0);
            expect(number).toBeLessThan(1);
        }
    });
});

describe("shuffle", () => {
    const items = Array.from({ length: 20 }, (_, index) => index);

    it("mantém exatamente os mesmos elementos", () => {
        expect(shuffle(items, createSeededRandom("x")).sort((a, b) => a - b)).toEqual(items);
    });

    it("não altera a lista original", () => {
        const original = [...items];
        shuffle(items, createSeededRandom("x"));
        expect(items).toEqual(original);
    });

    it("embaralha igual para a mesma seed", () => {
        expect(shuffle(items, createSeededRandom("x"))).toEqual(shuffle(items, createSeededRandom("x")));
    });
});
