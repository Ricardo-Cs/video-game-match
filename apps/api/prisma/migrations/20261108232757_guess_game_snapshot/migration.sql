/*
  Warnings:

  - Added the required column `game_name` to the `guesses` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "guesses" ADD COLUMN     "cover_url" TEXT,
ADD COLUMN     "game_name" TEXT NOT NULL;
