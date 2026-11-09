-- O jogo premiado é identificado pelo igdb_id: nomes se repetem na IGDB
-- (há um "Hades" de 1995), e dois vencedores homônimos quebrariam o seed.
DROP INDEX "games_name_key";
