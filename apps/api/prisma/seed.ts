import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

// Seed idempotente: pode rodar várias vezes sem duplicar (upsert por nome).
// Curadoria de prêmios por ano; o catálogo de jogos completo vem da IGDB.
const GOTY = "Game Of The Year";
const BEST_INDIE = "Best Indie Game";

const winners: { award: string; year: number; game: string }[] = [
    { award: GOTY, year: 2014, game: "Dragon Age: Inquisition" },
    { award: GOTY, year: 2015, game: "The Witcher 3: Wild Hunt" },
    { award: GOTY, year: 2016, game: "Overwatch" },
    { award: GOTY, year: 2017, game: "The Legend of Zelda: Breath of the Wild" },
    { award: GOTY, year: 2018, game: "God of War" },
    { award: GOTY, year: 2019, game: "Sekiro: Shadows Die Twice" },
    { award: GOTY, year: 2020, game: "The Last of Us Part II" },
    { award: GOTY, year: 2021, game: "It Takes Two" },
    { award: GOTY, year: 2022, game: "Elden Ring" },
    { award: GOTY, year: 2023, game: "Baldur's Gate 3" },
    { award: GOTY, year: 2024, game: "Astro Bot" },
    { award: BEST_INDIE, year: 2014, game: "Shovel Knight" },
    { award: BEST_INDIE, year: 2015, game: "Rocket League" },
    { award: BEST_INDIE, year: 2016, game: "Inside" },
    { award: BEST_INDIE, year: 2017, game: "Cuphead" },
    { award: BEST_INDIE, year: 2018, game: "Celeste" },
    { award: BEST_INDIE, year: 2019, game: "Disco Elysium" },
    { award: BEST_INDIE, year: 2020, game: "Hades" },
    { award: BEST_INDIE, year: 2021, game: "Kena: Bridge of Spirits" },
    { award: BEST_INDIE, year: 2022, game: "Stray" },
    { award: BEST_INDIE, year: 2023, game: "Sea of Stars" },
    { award: BEST_INDIE, year: 2024, game: "Balatro" },
];

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL não definida");

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

async function main() {
    for (const { award, year, game } of winners) {
        const [awardRow, gameRow] = await Promise.all([
            prisma.award.upsert({ where: { name: award }, update: {}, create: { name: award } }),
            prisma.game.upsert({ where: { name: game }, update: {}, create: { name: game } }),
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
