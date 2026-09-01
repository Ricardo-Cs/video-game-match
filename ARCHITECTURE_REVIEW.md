# Revisão de Arquitetura — Video Game Match

> Avaliação feita em 2026-09-01, sobre o estado da branch `main` (commit `7be5e51`).
> Escopo: `game-api` (backend Express + Prisma) e `game-app` (frontend React + Vite).

## Resumo

O **backend está bem arquitetado** para o tamanho do projeto. O **frontend ficou para trás e hoje não compila**.

O que já está bom no `game-api`:

- Camadas separadas de verdade: `routes → controllers → services → integrations/repositories/validators`.
- Validação Zod na borda (`middlewares/validateRequest.ts` + `schemas/gameSchemas.ts`).
- Tratamento de erro centralizado (`middlewares/errorHandler.ts`) com `AppError` tipado.
- Variáveis de ambiente validadas no boot (`config/env.ts`).
- Shutdown gracioso fechando servidor HTTP e conexão do Prisma.

Isso é mais disciplina do que a maioria dos projetos desse porte tem. Os pontos abaixo estão ordenados por prioridade.

---

## 1. O frontend está quebrado e desconectado da API

**Maior débito do projeto.** `npx tsc -b` em `game-app` falha agora:

```
src/App.tsx(8,26): error TS2307: Cannot find module './pages/Singleplayer'
src/App.tsx(9,25): error TS2307: Cannot find module './pages/Multiplayer'
src/components/GameBoard.tsx(1,17): error TS6133: 'useState' is declared but its value is never read.
src/components/GameBoard.tsx(16,3): error TS6133: 'currentPlayer' is declared but its value is never read.
```

Além disso:

- `src/components/GameBoard.tsx` é sobra de um boilerplate de **jogo da velha** (tabuleiro 3x3, `currentPlayer` "X ou O"). Não é importado por ninguém e não tem relação com o domínio do projeto.
- Não existe **nenhuma** chamada HTTP no `game-app`. O frontend nunca consumiu essa API.

**Sugestões**

- Apagar `GameBoard.tsx`.
- Criar `src/services/api.ts` (axios ou fetch) lendo `VITE_API_URL` do ambiente.
- Implementar a página `Singleplayer` de verdade, consumindo `/game/createCategories`, `/game/search/:search` e `/game/verifyAnswer`.
- Decidir o destino da rota `/multiplayer` (ver item 3) — enquanto não existir, remover a rota e o link do `Navbar`.

---

## 2. O cliente é dono das regras da rodada — dá pra trapacear

`POST /game/verifyAnswer` recebe as categorias **e as condições** dentro do corpo da requisição (`schemas/gameSchemas.ts` → `verifyAnswerSchema`). Nada impede o cliente de enviar categorias trivialmente fáceis, ou de omitir as difíceis.

O servidor já é quem sorteia as categorias (`utils/createCategories.ts`), então ele deveria ser o dono do estado da rodada.

**Sugestão**

- Persistir a rodada no servidor ao sorteá-la (`roundId` + categorias escolhidas).
- O cliente passa a enviar apenas `{ roundId, gameId }`.
- O servidor recarrega as categorias daquela rodada e valida.

É correção de arquitetura, não só de antifraude — e vira pré-requisito obrigatório se o multiplayer sair do papel.

---

## 3. Multiplayer sem servidor

`socket.io-client` está em `game-app/package.json`, mas não existe socket.io no backend nem qualquer estado de sala. O botão de multiplayer no `Home.tsx` já está `disabled`.

**Sugestão**: ou assumir a decisão arquitetural (estado de sala/rodada no servidor — depende do item 2), ou remover a dependência para não sugerir uma capacidade que não existe.

---

## 4. Sem cache da IGDB

Todo `verifyAnswer` faz uma chamada nova a `getGameById` (`integrations/igdb.ts`). Um cache por `gameId` — in-memory simples ou uma tabela no SQLite — reduz latência, consumo de cota e a dependência de rede.

Relevante também porque **a rede atual bloqueia `id.twitch.tv`** (endpoint OAuth que gera o `CLIENT_TOKEN`); `api.igdb.com` em si responde normalmente. Um cache amortece esse tipo de indisponibilidade. Ver também `src/data/data.json` como fonte de fallback para desenvolvimento offline.

---

## 5. Acoplamento por strings soltas

`category.type` e `condition.operator` são `z.string()` livres no schema, resolvidos por um `switch` em `validators/index.ts` com `default: return false`.

Consequência: uma categoria com tipo inválido **falha em silêncio** e o jogador recebe "resposta incorreta" sem que nada seja logado.

**Sugestão**

- Trocar por `z.enum([...])` nos schemas.
- Substituir o `switch` por um registry `Record<CategoryType, Validator>`.

Assim o TypeScript acusa caso faltante em vez de errar calado, e adicionar categoria nova vira "adicionar uma entrada no registry".

---

## 6. Três fontes de dados sem coesão

- Categorias → `src/data/data.json`
- Prêmios → SQLite via Prisma
- Jogos → IGDB

Dois problemas:

- `repositories/categoriesRepository.ts` faz `fs.readFileSync` **a cada request**. O arquivo é estático — basta ler uma vez na carga do módulo.
- Conceitualmente, as categorias deveriam morar no banco junto com os prêmios, para haver uma única fonte de verdade.

---

## 7. Sem testes e sem migrations

**Testes**: zero arquivos de teste no repositório. Os validators (`validators/*.ts`) e `createCategories` são funções puras — o melhor custo-benefício de teste que existe, e são literalmente as regras do jogo. Vitest resolve com pouquíssimo setup.

**Migrations**: `prisma/` não tem diretório `migrations/`. O schema só existe materializado no `dev.db`, que está **versionado no git**, com `insert.sql` como seed manual.

**Sugestão**: rodar `prisma migrate dev` para gerar as migrations, parar de versionar o `.db` (adicionar ao `.gitignore`) e manter migration + seed no controle de versão.

---

## 8. Pontos menores

- **`awardValidator`** lança `Error` genérico quando o prêmio não existe no banco → vira 500 opaco. Deveria ser `AppError` com status adequado (ou simplesmente retornar `false`).
- **`createCategories`** é um `while` com sorteio aleatório e **sem limite de iterações**. Hoje funciona (18 categorias, 3 pares incompatíveis), mas é loop infinito em potencial. Embaralhar a lista e pegar os 6 primeiros compatíveis resolve em tempo determinístico.
- **Segurança HTTP**: `cors()` aberto para qualquer origem, sem `helmet`, sem rate limit e sem log de requisições.
- **`GET /game/createCategories`** não é idempotente (sorteia a cada chamada) e usa verbo na URL. `POST /rounds` casa melhor com o item 2.
- **Monorepo informal**: as duas pastas são projetos soltos, sem workspace. Os tipos de resposta (`GameSearchResult`, `checkAnswerType`, `Category`) vão acabar duplicados no frontend. npm workspaces + um pacote `shared` de tipos resolve barato.

---

## Prioridade sugerida

Se for para escolher três frentes:

1. **Frontend funcionando contra a API real** (item 1)
2. **Rodada com estado no servidor** (item 2)
3. **Cache da IGDB** (item 4)

Os três juntos transformam o projeto de "backend bonito sem demo" em algo jogável e defensável em portfólio.
