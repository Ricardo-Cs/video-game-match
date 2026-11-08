import { defineConfig } from "prisma/config";

// O CLI do Prisma 7 não carrega o .env sozinho
try {
    process.loadEnvFile();
} catch {
    // sem .env: usa as variáveis já presentes no ambiente (CI, produção)
}

export default defineConfig({
    schema: "prisma/schema.prisma",
    migrations: {
        path: "prisma/migrations",
        seed: "tsx prisma/seed.ts",
    },
    datasource: {
        // `prisma generate` não conecta ao banco, então não exige a variável
        url: process.env.DATABASE_URL ?? "",
    },
});
