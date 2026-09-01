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
- **`company` não distingue desenvolvedora de publicadora**: `checkAnswer` achata `involved_companies` em nomes e ignora os booleans `developer` / `publisher` / `porting` / `supporting`. "Jogo da Nintendo" aceita hoje um jogo apenas *publicado* pela Nintendo. Ver Anexo A.
- **Condições casam por string, não por id**: o valor `"FromSoftware."` (com ponto final) em `data/data.json` é sintoma disso. Fixar o id numérico da IGDB na condição é mais robusto que o nome.

---

## Prioridade sugerida

Se for para escolher três frentes:

1. **Frontend funcionando contra a API real** (item 1)
2. **Rodada com estado no servidor** (item 2)
3. **Cache da IGDB** (item 4)

Os três juntos transformam o projeto de "backend bonito sem demo" em algo jogável e defensável em portfólio.

---

# Anexo A — Liberdade dos dados da IGDB e expansão de categorias

> Levantamento feito sobre os tipos gerados do schema IGDB v4
> (`DmitryScaletta/igdb-api-types`), já que a rede atual não permite gerar token para consultar a API direto.

**Conclusão: o limite não é a IGDB, é o código.**

Hoje o projeto tem **7 tipos** de categoria (`genre`, `releaseYear`, `company`, `platform`, `gameMode`, `dlcs`, `award`) e **18 categorias** concretas em `data/data.json`. O objeto `Game` da IGDB expõe **~55 campos**, e `integrations/igdb.ts → getGameById` busca apenas 9 deles.

## A.1 Campos disponíveis e não usados

| Campo IGDB | Categorias que renderia | Vocabulário |
|---|---|---|
| `themes` | "Tem terror", "Ficção científica", "Mundo aberto", "Comédia", "Furtivo" | ~22 valores |
| `player_perspectives` | "Primeira pessoa", "Visão isométrica", "Visão lateral", "VR" | ~7 valores |
| `game_engines` | "Feito na Unreal", "Feito na Unity", "Feito na RE Engine" | centenas |
| `franchises` / `collections` | "Da franquia Mario", "Da série Final Fantasy" | milhares |
| `total_rating` / `aggregated_rating` / `rating_count` | "Nota acima de 90", "Nota abaixo de 70", "Mais de 500 avaliações" | numérico contínuo |
| `age_ratings` | "Classificação M/18", "Livre para todas as idades" | ESRB, PEGI, USK… |
| `multiplayer_modes` | "Tem tela dividida", "Coop online", "Coop na campanha", "4+ jogadores locais" | booleans: `splitscreen`, `onlinecoop`, `campaigncoop`, `offlinecoopmax` |
| `game_type` | "É uma expansão", "É um remake", "É um port" | 15 valores |
| `remakes` / `remasters` / `ports` / `expansions` | "Ganhou um remake", "Foi remasterizado" | relação |
| `language_supports` | "Tem dublagem em português" | idioma × tipo de suporte |
| `platform.generation` / `platform_family` | "Console da 6ª geração", "Qualquer console Nintendo" | agrupa as 200+ plataformas |
| `keywords` | tags livres ("pixel art", "roguelike") | milhares, **ruidoso** |
| `/game_time_to_beat` | "Zerável em menos de 10 horas" | endpoint separado |

Como categoria é o par **(tipo, valor)**, cada valor de vocabulário vira uma categoria. Só com gêneros, temas, perspectivas, modos multiplayer, faixas de nota e plataformas relevantes chega-se a **150–300 categorias jogáveis** sem nenhum dado externo. Franquias e engines levam à casa dos milhares.

## A.2 Ganho barato imediato: developer vs publisher

`involved_companies` traz os booleans `developer`, `publisher`, `porting` e `supporting`. O código atual ignora todos:

```ts
// validators/index.ts
companyValidator(apiResponse.involved_companies?.map((c) => c.company.name), value as string)
```

Resultado: "Jogo da Nintendo" aceita um jogo apenas **publicado** pela Nintendo e desenvolvido por outro estúdio. Separando os flags, cada empresa vira duas categorias distintas e mais justas: "Desenvolvido pela X" e "Publicado pela X".

## A.3 Limites reais da IGDB

1. **Campo vazio é campo omitido.** A IGDB não devolve `null`, ela suprime a chave — *ausência de dado é indistinguível de "não tem"*. Isso torna categorias negativas ("não tem DLC", "não tem coop") pouco confiáveis; o `dlcsValidator` atual já vive nesse risco.
2. **Completude irregular.** `multiplayer_modes`, `language_supports` e `game_engines` dependem de contribuição da comunidade e faltam até em jogos famosos. Categoria baseada neles gera falso negativo.
3. **`keywords` é vocabulário livre**, sem curadoria — bom para volume, ruim para regra de jogo.
4. **Match por nome exato é frágil** — usar id numérico na condição (ver item 8).
5. **Rate limit de ~4 req/s** — o cache do item 4 deixa de ser opcional se as categorias multiplicarem.
6. **Prêmios não vêm da IGDB.** `award` sai do SQLite local; é a única dimensão cuja expansão exige curadoria manual.

## A.4 O que precisa mudar no código para escalar

Com 18 categorias o design atual aguenta. Com 200, três coisas quebram:

- **`getGameById` tem lista fixa de campos** — cada tipo novo exige editar a query à mão. Melhor: derivar os campos necessários a partir dos tipos das categorias sorteadas para a rodada.
- **O `switch` de `checkAnswer`** vira inadministrável → registry `Record<CategoryType, Validator>` (item 5).
- **`incompatiblePairs` é hardcoded por nome** em `utils/createCategories.ts` — O(n²) manual, inviável com 200 categorias. A incompatibilidade precisa ser **derivada da condição** (mesmo tipo + operadores/faixas mutuamente exclusivos), não listada à mão.

## A.5 Oportunidade: validar a rodada antes de servir

A IGDB aceita `count` nos endpoints (ex.: `POST /games/count`). Dá para perguntar **quantos jogos satisfazem uma combinação de categorias** antes de servir a rodada. Isso entrega duas coisas de uma vez:

- **garantia de rodada solucionável** (nenhuma combinação com zero jogos possíveis);
- **métrica objetiva de dificuldade** por categoria e por combinação.

Para um jogo em formato de grade, isso vale mais do que dobrar o número de categorias — e encaixa naturalmente no estado de rodada no servidor (item 2).
