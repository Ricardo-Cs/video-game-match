-- SQL para inserir dados no dev.db
-- Os dados já estão inseridos no arquivo, mas caso queira inserir, no diretório prisma digite: sqlite3 dev.db < insert.sql (sqlite deve ter sido instalado e adicionado ao path)

INSERT INTO Award (name) values 
('Game Of The Year'),
('Best Indie Game');

INSERT INTO Game (id, name) values
(1, 'Dragon Age: Inquisition'),
(2, 'The Witcher 3: Wild Hunt'),
(3, 'Overwatch'),
(4, 'The Legend of Zelda: Breath of the Wild'),
(5, 'God of War'),
(6, 'Sekiro: Shadows Die Twice'),
(7, 'The Last of Us Part II'),
(8, 'It Takes Two'),
(9, 'Elden Ring'),
(10, 'Baldur''s Gate 3'),
(11, 'Astro Bot'),
(12, 'Shovel Knight'),
(13, 'Rocket League'),
(14, 'Inside'),
(15, 'Cuphead'),
(16, 'Celeste'),
(17, 'Disco Elysium'),
(18, 'Hades'),
(19, 'Kena: Bridge of Spirits'),
(20, 'Stray'),
(21, 'Sea of Stars'),
(22, 'Balatro');

INSERT INTO game_award (game_id_fk, award_id_fk, year) values 
(1, 1, 2014),
(2, 1, 2015),
(3, 1, 2016),
(4, 1, 2017),
(5, 1, 2018),
(6, 1, 2019),
(7, 1, 2020),
(8, 1, 2021),
(9, 1, 2022),
(10, 1, 2023),
(11, 1, 2024),
(12, 2, 2014),
(13, 2, 2015),
(14, 2, 2016),
(15, 2, 2017),
(16, 2, 2018),
(17, 2, 2019),
(18, 2, 2020),
(19, 2, 2021),
(20, 2, 2022),
(21, 2, 2023),
(22, 2, 2024);

