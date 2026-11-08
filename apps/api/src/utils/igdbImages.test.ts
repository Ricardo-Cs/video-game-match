import { describe, expect, it } from "vitest";

import { coverUrlOf } from "./igdbImages";

const GAME = { id: 1942, name: "The Witcher 3: Wild Hunt" };

describe("coverUrlOf", () => {
    it("troca a miniatura pela capa grande e adiciona o protocolo", () => {
        const game = { ...GAME, cover: { id: 1, url: "//images.igdb.com/igdb/image/upload/t_thumb/co1.jpg" } };

        expect(coverUrlOf(game)).toBe("https://images.igdb.com/igdb/image/upload/t_cover_big/co1.jpg");
    });

    it("devolve null quando o jogo não tem capa", () => {
        expect(coverUrlOf(GAME)).toBeNull();
    });
});
