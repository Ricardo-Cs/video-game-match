import { describe, expect, it } from "vitest";

import { companyValidator } from "./developersValidator";
import { gameModeValidator } from "./gameModeValidator";
import { genreValidator } from "./genreValidator";
import { platformValidator } from "./platformValidator";

/**
 * Os quatro validators abaixo têm a mesma regra: o valor da condição precisa
 * estar na lista que a IGDB devolveu. Testados em conjunto para que qualquer
 * divergência futura entre eles apareça.
 */
const listValidators = [
    { name: "genreValidator", validate: genreValidator, present: "Action", absent: "Puzzle" },
    { name: "platformValidator", validate: platformValidator, present: "PlayStation 2", absent: "Nintendo 64" },
    { name: "gameModeValidator", validate: gameModeValidator, present: "Single player", absent: "Multiplayer" },
    { name: "companyValidator", validate: companyValidator, present: "Nintendo", absent: "Valve" },
] as const;

describe.each(listValidators)("$name", ({ validate, present, absent }) => {
    it("aceita quando o valor está na lista", () => {
        expect(validate([present, "Outro"], present)).toBe(true);
    });

    it("recusa quando o valor não está na lista", () => {
        expect(validate([present], absent)).toBe(false);
    });

    it("recusa lista vazia", () => {
        expect(validate([], present)).toBe(false);
    });

    // A IGDB omite a chave quando o campo está vazio (não manda null), então
    // undefined chega aqui com frequência e não pode explodir.
    it("recusa quando a IGDB omitiu o campo", () => {
        expect(validate(undefined, present)).toBe(false);
    });

    it("compara de forma exata, sem normalizar", () => {
        expect(validate([present.toLowerCase()], present)).toBe(false);
        expect(validate([` ${present}`], present)).toBe(false);
    });
});

/**
 * Documenta a fragilidade do item 8 da revisão: a condição casa por string
 * literal, então "FromSoftware." (com ponto final, como está em data.json)
 * só bate se a IGDB devolver exatamente esse texto.
 */
it("companyValidator: o ponto final de 'FromSoftware.' é significativo", () => {
    expect(companyValidator(["FromSoftware"], "FromSoftware.")).toBe(false);
    expect(companyValidator(["FromSoftware."], "FromSoftware.")).toBe(true);
});
