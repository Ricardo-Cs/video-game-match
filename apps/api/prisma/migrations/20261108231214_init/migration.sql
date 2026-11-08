-- CreateTable
CREATE TABLE "awards" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "awards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "games" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "games_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "game_awards" (
    "game_id" INTEGER NOT NULL,
    "award_id" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,

    CONSTRAINT "game_awards_pkey" PRIMARY KEY ("game_id","award_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "awards_name_key" ON "awards"("name");

-- CreateIndex
CREATE UNIQUE INDEX "games_name_key" ON "games"("name");

-- CreateIndex
CREATE INDEX "game_awards_award_id_idx" ON "game_awards"("award_id");

-- AddForeignKey
ALTER TABLE "game_awards" ADD CONSTRAINT "game_awards_award_id_fkey" FOREIGN KEY ("award_id") REFERENCES "awards"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "game_awards" ADD CONSTRAINT "game_awards_game_id_fkey" FOREIGN KEY ("game_id") REFERENCES "games"("id") ON DELETE CASCADE ON UPDATE CASCADE;
