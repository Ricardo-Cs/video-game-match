# Roadmap — Video Game Match

> Atualizado em 2026-10-22.

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

> **Decisão pendente:** manter **SQLite** (simples, sem Docker) ou migrar para **Postgres** (Docker local + Neon/Supabase no deploy). Recomendado: Postgres, se o objetivo é fazer deploy.

- [ ] Migrar para Prisma >= 7.10.1 (`prisma.config.ts`, novo gerador `prisma-client`, driver adapter) e remover o `overrides` de `deepmerge-ts` do `pnpm-workspace.yaml`
- [ ] Migrations do Prisma versionadas; tirar `dev.db` do git; seed no lugar do `insert.sql` manual
- [ ] Tabela `Round`: as 6 categorias sorteadas, data e seed
- [ ] Tabela `Guess`: rodada, célula, `igdb_game_id`, acerto/erro
- [ ] Tabela `GameCache`: resposta da IGDB por jogo, com TTL
- [ ] `POST /rounds`: sorteia e persiste a rodada (substitui `GET /game/createCategories`)
- [ ] `POST /rounds/:id/guesses`: recebe só `{ cell, gameId }`; o servidor valida com as categorias que ele mesmo guardou (substitui `POST /game/verifyAnswer`)
- [ ] Regra: o mesmo jogo não vale em duas células
- [ ] Regra: limite de tentativas por rodada
- [ ] Cache da IGDB por `gameId` (reduz latência, cota e dependência de rede)
- [ ] `createCategories` com sorteio determinístico (embaralhar e pegar os compatíveis), sem `while` infinito — reativar o teste hoje em `it.skip`
- [ ] Registry `Record<CategoryType, Validator>` no lugar do `switch` do `checkAnswer`
- [ ] Atualizar `@vgm/contracts` com os formatos de rodada e palpite

### Etapa 4 — Grade jogável no web

Hoje `apps/web/src/pages/Singleplayer.tsx` é um placeholder.

- [ ] Grade 3×3 com categorias nas linhas e colunas
- [ ] Busca com autocomplete e *debounce*
- [ ] Estado de cada célula (vazia, acerto, erro)
- [ ] Capa do jogo acertado em tamanho maior (trocar `t_thumb` por `t_cover_big` na URL da IGDB)
- [ ] Contador de tentativas e tela de fim de jogo
- [ ] Layout mobile-first

### Etapa 5 — Categorias melhores

- [ ] Separar "Desenvolvido por" de "Publicado por" (usar os booleans `developer`/`publisher` de `involved_companies`)
- [ ] Condições por id da IGDB, não por nome (corrige casos como `"FromSoftware."`)
- [ ] Prêmios ligados por `igdb_id` em vez do nome do jogo; passar a usar o ano (`game_award.year`)
- [ ] Novas categorias: temas, perspectiva, franquia, faixa de nota, modos multiplayer, geração de console
- [ ] Campos buscados na IGDB derivados das categorias da rodada (hoje a lista em `getGameById` é fixa)
- [ ] Incompatibilidades deduzidas da condição (mesmo tipo + faixas excludentes), não listadas à mão
- [ ] Rodada sempre solucionável: checar com `POST /games/count` da IGDB que cada célula tem resposta antes de servir a grade (serve também como métrica de dificuldade)

> Cuidado com os limites da IGDB: campo vazio é omitido (categorias negativas são pouco confiáveis), `multiplayer_modes`/`game_engines` têm completude irregular e o rate limit é de ~4 req/s.

### Etapa 6 — Produção e extras

**Segurança e observabilidade**
- [ ] `helmet`, CORS restrito à origem do web, rate limit
- [ ] Logs estruturados com pino
- [ ] Rota 404 respondendo `{ message }`, como as demais

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

- [ ] `@mui/material` / `@mui/icons-material` 7 → 9 — fazer antes da grade da etapa 4, enquanto há pouca UI
- [ ] `vite` 7 → 8 (Rolldown) junto com `@vitejs/plugin-react` 5 → 6
- [ ] `vitest` 4 → 5
- [ ] `typescript` 5.9 → 7 (compilador nativo em Go)
- [ ] `globals` 16 → 17, `eslint-plugin-react-refresh` 0.4 → 0.5

> A tag `latest` do `prisma` no npm aponta para uma RC (`8.0.0-rc.*`): fixar a versão ao atualizar.
