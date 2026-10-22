# Video Game Match

Jogo de grade no estilo *Immaculate Grid*: o servidor sorteia categorias (gênero, ano, empresa, plataforma, prêmio…) e o jogador precisa encontrar um jogo que atenda à linha e à coluna de cada célula. Os jogos vêm da [IGDB](https://api-docs.igdb.com/).

## Estrutura

```
apps/
  api/        Express 5 + Prisma (SQLite) + integração IGDB
  web/        React 19 + Vite + MUI + TanStack Query
packages/
  contracts/  Schemas Zod e tipos compartilhados entre api e web
```

`@vgm/contracts` exporta TypeScript direto (sem build próprio): a API o valida na borda e o web importa só os tipos. O build da API (`esbuild`) embute o pacote no bundle.

## Pré-requisitos

- Node.js 22.12+
- pnpm 12 — `npm install -g pnpm@12.10.1` (a versão exata fica em `packageManager` no `package.json`)
- Credenciais de um app em [dev.twitch.tv/console/apps](https://dev.twitch.tv/console/apps) (a IGDB autentica pela Twitch)

## Primeiros passos

```bash
pnpm install

cp apps/api/.env.example apps/api/.env   # preencha CLIENT_ID e CLIENT_SECRET
cp apps/web/.env.example apps/web/.env

pnpm --filter @vgm/api exec prisma generate
pnpm dev                                  # sobe api (3333) e web (5173) juntos
```

## Scripts da raiz

| Comando          | O que faz                                  |
|------------------|--------------------------------------------|
| `pnpm dev`       | API e web em modo watch, em paralelo       |
| `pnpm build`     | Build de todos os pacotes                  |
| `pnpm test`      | Testes (Vitest)                            |
| `pnpm typecheck` | `tsc` em todos os pacotes                  |
| `pnpm lint`      | ESLint                                     |

Para rodar em um pacote só: `pnpm --filter @vgm/api test`.

## Dependências

Versões compartilhadas (TypeScript, Zod, Vitest) ficam no `catalog` do `pnpm-workspace.yaml`. O pnpm só instala versões publicadas há pelo menos 7 dias (`minimumReleaseAge`) e só executa scripts de instalação dos pacotes listados em `allowBuilds`.
