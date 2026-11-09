import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

// Seed idempotente: pode rodar várias vezes sem duplicar (upsert por nome do prêmio e igdbId do jogo).
// Curadoria de prêmios por ano; o catálogo de jogos completo vem da IGDB.
const GOTY = "Game Of The Year";
const BEST_INDIE = "Best Indie Game";

// igdbId conferido na IGDB: o nome sozinho é ambíguo ("Hades" de 1995 x 2020, "Stray" de 2017 x 2022)
const winners: { award: string; year: number; game: string; igdbId: number }[] = [
    { award: GOTY, year: 2014, game: "Dragon Age: Inquisition", igdbId: 1887 },
    { award: GOTY, year: 2015, game: "The Witcher 3: Wild Hunt", igdbId: 1942 },
    { award: GOTY, year: 2016, game: "Overwatch", igdbId: 8173 },
    { award: GOTY, year: 2017, game: "The Legend of Zelda: Breath of the Wild", igdbId: 7346 },
    { award: GOTY, year: 2018, game: "God of War", igdbId: 19560 },
    { award: GOTY, year: 2019, game: "Sekiro: Shadows Die Twice", igdbId: 76882 },
    { award: GOTY, year: 2020, game: "The Last of Us Part II", igdbId: 26192 },
    { award: GOTY, year: 2021, game: "It Takes Two", igdbId: 135243 },
    { award: GOTY, year: 2022, game: "Elden Ring", igdbId: 119133 },
    { award: GOTY, year: 2023, game: "Baldur's Gate 3", igdbId: 119171 },
    { award: GOTY, year: 2024, game: "Astro Bot", igdbId: 303811 },
    { award: BEST_INDIE, year: 2014, game: "Shovel Knight", igdbId: 7444 },
    { award: BEST_INDIE, year: 2015, game: "Rocket League", igdbId: 11198 },
    { award: BEST_INDIE, year: 2016, game: "Inside", igdbId: 7342 },
    { award: BEST_INDIE, year: 2017, game: "Cuphead", igdbId: 9061 },
    { award: BEST_INDIE, year: 2018, game: "Celeste", igdbId: 26226 },
    { award: BEST_INDIE, year: 2019, game: "Disco Elysium", igdbId: 26472 },
    { award: BEST_INDIE, year: 2020, game: "Hades", igdbId: 113112 },
    { award: BEST_INDIE, year: 2021, game: "Kena: Bridge of Spirits", igdbId: 134588 },
    { award: BEST_INDIE, year: 2022, game: "Stray", igdbId: 110248 },
    { award: BEST_INDIE, year: 2023, game: "Sea of Stars", igdbId: 131890 },
    { award: BEST_INDIE, year: 2024, game: "Balatro", igdbId: 251833 },
];

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL não definida");

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

async function main() {
    for (const { award, year, game, igdbId } of winners) {
        const [awardRow, gameRow] = await Promise.all([
            prisma.award.upsert({ where: { name: award }, update: {}, create: { name: award } }),
            prisma.game.upsert({ where: { igdbId }, update: { name: game }, create: { igdbId, name: game } }),
        ]);

        await prisma.gameAward.upsert({
            where: { gameId_awardId: { gameId: gameRow.id, awardId: awardRow.id } },
            update: { year },
            create: { gameId: gameRow.id, awardId: awardRow.id, year },
        });
    }
    console.log(`Seed concluído: ${winners.length} premiações.`);
}

main()
    .catch((error) => {
        console.error(error);
        process.exitCode = 1;
    })
    .finally(() => prisma.$disconnect());
