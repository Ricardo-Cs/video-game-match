-- CreateEnum
CREATE TYPE "RoundStatus" AS ENUM ('IN_PROGRESS', 'FINISHED');

-- CreateTable
CREATE TABLE "rounds" (
    "id" UUID NOT NULL,
    "seed" TEXT NOT NULL,
    "categories" JSONB NOT NULL,
    "max_attempts" INTEGER NOT NULL,
    "status" "RoundStatus" NOT NULL DEFAULT 'IN_PROGRESS',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "finished_at" TIMESTAMP(3),

    CONSTRAINT "rounds_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "guesses" (
    "id" UUID NOT NULL,
    "round_id" UUID NOT NULL,
    "cell" SMALLINT NOT NULL,
    "igdb_game_id" INTEGER NOT NULL,
    "correct" BOOLEAN NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "guesses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "game_cache" (
    "igdb_game_id" INTEGER NOT NULL,
    "data" JSONB NOT NULL,
    "fetched_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "game_cache_pkey" PRIMARY KEY ("igdb_game_id")
);

-- CreateIndex
CREATE INDEX "rounds_created_at_idx" ON "rounds"("created_at");

-- CreateIndex
CREATE INDEX "guesses_round_id_idx" ON "guesses"("round_id");

-- CreateIndex
CREATE INDEX "guesses_igdb_game_id_idx" ON "guesses"("igdb_game_id");

-- CreateIndex
CREATE INDEX "game_cache_expires_at_idx" ON "game_cache"("expires_at");

-- AddForeignKey
ALTER TABLE "guesses" ADD CONSTRAINT "guesses_round_id_fkey" FOREIGN KEY ("round_id") REFERENCES "rounds"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Regras que o Prisma não expressa no schema (índices parciais e CHECK).
-- O Prisma não gerencia esses objetos, então futuras migrations não os removem.

-- Uma única resposta certa por célula
CREATE UNIQUE INDEX "guesses_round_id_cell_correct_key" ON "guesses"("round_id", "cell") WHERE "correct";

-- O mesmo jogo não vale em duas células da mesma rodada
CREATE UNIQUE INDEX "guesses_round_id_igdb_game_id_correct_key" ON "guesses"("round_id", "igdb_game_id") WHERE "correct";

ALTER TABLE "guesses" ADD CONSTRAINT "guesses_cell_check" CHECK ("cell" BETWEEN 0 AND 8);
ALTER TABLE "guesses" ADD CONSTRAINT "guesses_igdb_game_id_check" CHECK ("igdb_game_id" > 0);
ALTER TABLE "rounds" ADD CONSTRAINT "rounds_max_attempts_check" CHECK ("max_attempts" > 0);
