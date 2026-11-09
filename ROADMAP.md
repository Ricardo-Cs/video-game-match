# Roadmap — Video Game Match

> Atualizado em 2026-11-09.

## Concluído

### ✅ Etapa 1 — Correções rápidas (`f0b0f1c`)

- [x] Sanitização do termo de busca e id restrito a inteiro positivo (injeção na query Apicalypse da IGDB)
- [x] App access token da Twitch gerado e renovado automaticamente (`CLIENT_SECRET` no lugar do `CLIENT_TOKEN` fixo), com retry único em 401
- [x] Timeout de 10s nas chamadas à Twitch e à IGDB
- [x] `awardValidator` responde `AppError 400` para prêmio inexistente
- [x] `data.json` lido e validado com Zod uma única vez no boot
- [x] `type`/`operator` de categoria como `z.enum`; `switch` do `checkAnswer` com checagem de exaustividade

### ✅ Etapa 2 — Monorepo e contratos (`2c82e38`)

- [x] `game-api` → `apps/api` (`@vgm/api`), `game-app` → `apps/web` (`@vgm/web`)
- [x] `packages/contracts` (`@vgm/contracts`): schemas Zod e tipos compartilhados entre API e web
- [x] pnpm workspaces com `catalog`, `minimumReleaseAge` de 7 dias e `allowBuilds` restrito
- [x] Build da API com esbuild; `tsc` só para typecheck (incluindo testes)
- [x] `data.json` importado como módulo; remoção de `dotenv`, `copy-data` e READMEs de template

---

## Pendente

### Etapa 3 — Rodada com estado no servidor

Maior mudança de arquitetura: fecha a trapaça (hoje o cliente envia as categorias e condições) e é pré-requisito das etapas seguintes.

> **Decisão tomada:** Postgres (Docker local via `docker-compose.yml` + Neon/Supabase no deploy).

- [x] Migrar para Prisma 7.10.1 (`prisma.config.ts`, gerador `prisma-client`, driver adapter `pg`), Postgres e remoção do `overrides` de `deepmerge-ts`
- [x] Migrations do Prisma versionadas; `dev.db` fora do git; seed idempotente (`pnpm --filter @vgm/api db:seed`) no lugar do `insert.sql`
- [x] Tabela `Round`: as 6 categorias sorteadas (snapshot em JSONB), seed, limite de tentativas e status
- [x] Tabela `Guess`: rodada, célula, `igdb_game_id`, acerto/erro — índices únicos parciais garantem no banco um acerto por célula e o mesmo jogo em no máximo uma célula
- [x] Tabela `GameCache`: resposta da IGDB por jogo, com `expires_at` — removida depois, quando o palpite passou a ser conferido direto na IGDB pelos filtros das categorias
- [x] `POST /rounds`: sorteia e persiste a rodada (substitui `GET /game/createCategories`); `GET /rounds/:id` devolve o estado atual
- [x] `POST /rounds/:id/guesses`: recebe só `{ cell, gameId }`; o servidor valida com as categorias que ele mesmo guardou (substitui `POST /game/verifyAnswer`)
- [x] Regra: o mesmo jogo não vale em duas células
- [x] Regra: limite de tentativas por rodada (9), garantido com trava da rodada na transação
- [x] Cache da IGDB por `gameId`, válido por 7 dias — removido junto com a tabela `GameCache`
- [x] `drawCategories` com sorteio determinístico por seed (embaralhar e pegar os compatíveis), sem `while` infinito — teste de catálogo insuficiente reativado
- [x] Registry `Record<CategoryType, CategoryValidator>` no lugar do `switch` do `checkAnswer`
- [x] Atualizar `@vgm/contracts` com os formatos de rodada e palpite

### Etapa 4 — Grade jogável no web

`/singleplayer` cria a rodada e leva a `/singleplayer/:roundId`, que sobrevive a um reload.

- [x] Grade 3×3 com categorias nas linhas e colunas
- [x] Busca com autocomplete e *debounce*
- [x] Estado de cada célula (vazia, acerto, erro) — `missedCells` no `RoundView`, derivado dos palpites no servidor
- [x] Capa do jogo acertado em tamanho maior (`t_cover_big`, já devolvida pela API em `solvedCells`)
- [x] Contador de tentativas e tela de fim de jogo
- [x] Layout mobile-first
- [x] Aviso de erro diz qual categoria o jogo não atendeu (`unmetCategories` no `GuessResult`), ex.: "Dave the Diver não atende a Vencedor de Melhor Jogo Indie". Deixa o jogo um pouco mais fácil, já que o erro revela parte da resposta

### Etapa 5 — Categorias melhores

- [x] Separar "Desenvolvido por" de "Publicado por" (usar os booleans `developer`/`publisher` de `involved_companies`)
- [x] Condições por id da IGDB, não por nome — o `"FromSoftware."` com ponto deixou a categoria impossível até ser corrigido à mão no `data.json`
- [x] Prêmios ligados por `igdb_id` em vez do nome do jogo
- [ ] Prêmios: passar a usar o ano (`game_award.year`). A PK `(game_id, award_id)` hoje impede o mesmo jogo de ganhar o mesmo prêmio em anos diferentes (ex.: "Best Ongoing Game")
- [x] Novas categorias: temas, perspectiva, franquia, faixa de nota, modos multiplayer, geração de console
  - "Ação" saiu do catálogo: na IGDB é tema, não gênero (`genres` nunca tem "Action"). Volta como categoria de tema.
- [x] "Jogo Multiplayer" aceita qualquer modo com mais de um jogador (Co-operative, Split screen, MMO, Battle Royale): na IGDB "Multiplayer" é um modo separado, e jogos só coop falham (ex.: Elden Ring Nightreign tem só Single player e Co-operative, já a Deluxe Edition tem Multiplayer). O par Coop × Multiplayer cai na checagem de implicação de `cellPlayability.ts`
- [x] Campos buscados na IGDB derivados das categorias da rodada — resolvido de outro jeito: cada categoria vira uma cláusula `where` e o palpite é conferido com `games/count`, sem buscar campos nem manter `game_cache`
- [x] Incompatibilidades deduzidas, não listadas à mão — pelas contagens: célula com tantas respostas quanto uma das categorias sozinha é implicação e fica fora (`cellPlayability.ts`)
- [x] Rodada sempre solucionável: checar com `POST /games/count` da IGDB que cada célula tem resposta antes de servir a grade (serve também como métrica de dificuldade). Substitui a lista de pares escrita à mão em `drawCategories.ts`; os prêmios ficam no banco local, então as células de prêmio precisam ser checadas contra os vencedores, não pela IGDB. Exigir um mínimo de respostas por célula, porque há pares com um único jogo possível (ex.: Jogo do Ano × PS3 só aceita Dragon Age: Inquisition)

**Lacunas conhecidas (dependem de consultar a IGDB para validar)**
- [ ] Jogo canônico: edições (`version_parent`), remasters e ports têm ids próprios, o que fura a regra "mesmo jogo em uma célula só", infla a contagem do `MIN_ANSWERS_PER_CELL` e faz o prêmio aceitar a Deluxe Edition mas não o remaster
- [ ] `GAME_TYPES` com nomes que não batem com o enum da IGDB (`8` é remake, `9` remaster, `10` expanded game; standalone expansion é `4`, port é `11`). Conferir em `/game_types` e decidir quais tipos aceitar
- [ ] `limit` na busca: sem ele a IGDB devolve só 10 resultados
- [ ] Contagem ignora popularidade: jogos obscuros (ou com uma única nota) tornam "jogáveis" células que ninguém resolve. Avaliar `total_rating_count` mínimo

> Cuidado com os limites da IGDB: campo vazio é omitido (categorias negativas são pouco confiáveis), `multiplayer_modes`/`game_engines` têm completude irregular e o rate limit é de ~4 req/s.

### Etapa 6 — Produção e extras

**Segurança e observabilidade**
- [ ] `helmet`, CORS restrito à origem do web
- [x] Rate limit na criação de rodadas (`POST /rounds`), espaçamento das chamadas à IGDB e nova tentativa após 429
  - Atrás de proxy no deploy, configurar `trust proxy` no Express, senão todos os jogadores dividem o mesmo limite
- [ ] Rodada sem dono: quem tem o link joga na rodada dos outros. Necessário antes de raridade e puzzle diário
- [ ] Limpeza de rodadas antigas (a tabela `rounds` cresce sem limite)
- [ ] Logs estruturados com pino
- [x] Rota 404 respondendo `{ message }`, como as demais

**CI e deploy**
- [ ] GitHub Actions: typecheck, testes e lint
- [ ] Dockerfile da API (necessário por causa do workspace)
- [ ] Deploy: web na Vercel; API na Fly, Render ou Railway

**Extras de jogo**
- [ ] Puzzle diário igual para todos
- [ ] Raridade da resposta ("só 3% escolheram esse jogo")
- [ ] Compartilhar o resultado em emojis

---

## Manutenção de dependências

Última auditoria (`pnpm audit`) em 2026-10-22: **sem vulnerabilidades conhecidas**, após o `overrides` de `deepmerge-ts` (GHSA-ggr8-5vv4-36mx, via Prisma 6) e o alinhamento de `@eslint/js` 10 com o `eslint` 10.

Versões major disponíveis, sem vulnerabilidade, adiadas por exigirem migração própria:

- [x] `@mui/material` / `@mui/icons-material` 7 → 9 — system props removidas (usar `sx`); navegadores mínimos: Chrome 117, Firefox 121, Safari 17
- [ ] `vite` 7 → 8 (Rolldown) junto com `@vitejs/plugin-react` 5 → 6
- [ ] `vitest` 4 → 5
- [ ] `typescript` 5.9 → 7 (compilador nativo em Go)
- [ ] `globals` 16 → 17, `eslint-plugin-react-refresh` 0.4 → 0.5

> A tag `latest` do `prisma` no npm aponta para uma RC (`8.0.0-rc.*`): fixar a versão ao atualizar.
