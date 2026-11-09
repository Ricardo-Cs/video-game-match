-- Prêmios passam a apontar para o jogo da IGDB por id, e não pelo nome:
-- nomes se repetem (há um "Hades" de 1995) e mudam ("Baldur's Gate III").
ALTER TABLE "games" ADD COLUMN "igdb_id" INTEGER;

-- Preenche os jogos já cadastrados pelo seed antigo. Um jogo fora desta lista
-- deixa a coluna nula e o SET NOT NULL abaixo falha, em vez de perder o vínculo.
UPDATE "games" SET "igdb_id" = curated.igdb_id
FROM (VALUES
    ('Dragon Age: Inquisition', 1887),
    ('The Witcher 3: Wild Hunt', 1942),
    ('Overwatch', 8173),
    ('The Legend of Zelda: Breath of the Wild', 7346),
    ('God of War', 19560),
    ('Sekiro: Shadows Die Twice', 76882),
    ('The Last of Us Part II', 26192),
    ('It Takes Two', 135243),
    ('Elden Ring', 119133),
    ('Baldur''s Gate 3', 119171),
    ('Astro Bot', 303811),
    ('Shovel Knight', 7444),
    ('Rocket League', 11198),
    ('Inside', 7342),
    ('Cuphead', 9061),
    ('Celeste', 26226),
    ('Disco Elysium', 26472),
    ('Hades', 113112),
    ('Kena: Bridge of Spirits', 134588),
    ('Stray', 110248),
    ('Sea of Stars', 131890),
    ('Balatro', 251833)
) AS curated(name, igdb_id)
WHERE "games"."name" = curated.name;

ALTER TABLE "games" ALTER COLUMN "igdb_id" SET NOT NULL;

CREATE UNIQUE INDEX "games_igdb_id_key" ON "games"("igdb_id");

-- O palpite passa a ser conferido direto na IGDB pelos filtros das categorias;
-- o cache da resposta completa do jogo deixou de ter uso.
DROP TABLE "game_cache";
