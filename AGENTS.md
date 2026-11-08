# AGENTS.md

Instruções para agentes de IA (e pessoas) que trabalham neste repositório.
Visão geral, setup e scripts estão no [README](README.md); o que falta fazer está no [ROADMAP](ROADMAP.md).

## Os dois princípios

Toda mudança é avaliada por estes dois critérios, nesta ordem.

### 1. O código se explica sozinho

Quem lê deve entender o que o código faz sem precisar de comentários.

- **Nomes que dizem o que a coisa é ou faz.** `drawRoundCategories`, `isCellAlreadySolved`, `MAX_ATTEMPTS_PER_ROUND`, e não `handle`, `check`, `data2` ou `n`. Booleanos começam com `is`, `has` ou `can`.
- **Funções pequenas, com uma única responsabilidade.** Se só dá para descrever a função usando "e", ela faz coisas demais e deve ser dividida.
- **Constantes nomeadas, não números ou strings mágicas.** `cell === 8` vira `cell === LAST_CELL_INDEX`.
- **Retorno antecipado em vez de `if` aninhado.** Trate os casos inválidos no topo e deixe o caminho principal sem indentação.
- **Tipos que contam a regra.** Prefira `z.enum`, uniões discriminadas e tipos específicos (`RoundId`, `CellIndex`) a `string`, `number` ou `any`. Um estado impossível não deve ser representável.
- **Comentários explicam o porquê, nunca o o quê.** Escreva um comentário só quando a razão não cabe no código: uma limitação da IGDB, uma regra de negócio que não é óbvia, um contorno de bug. Se você está escrevendo um comentário para explicar o que uma linha faz, renomeie ou extraia uma função.
- **Consistência acima de preferência pessoal.** Siga o padrão já usado no arquivo e no pacote.

### 2. Adicionar uma feature deve ser fácil e sem peso

Cada escolha deve deixar a próxima feature mais barata, não mais cara.

- **Extensão por registro, não por `switch`.** Coisas que crescem (tipos de categoria, validadores, modos de jogo) ficam em um mapa tipado, como `Record<CategoryType, Validator>`. Uma categoria nova é um arquivo novo mais uma linha no registro, sem mexer no que já funciona.
- **Camadas com papéis claros na API.** Uma camada só conversa com a de baixo:
  - `routes`: só liga a URL à validação e ao controller.
  - `controllers`: traduzem HTTP para chamada de serviço, sem regra de negócio.
  - `services`: regras do jogo, orquestração.
  - `repositories`: acesso ao banco (Prisma).
  - `integrations`: serviços externos (IGDB, Twitch).
  - `validators`: uma função pura por tipo de categoria.
- **Contratos em um só lugar.** Todo formato que trafega entre API e web é um schema Zod em `@vgm/contracts`. A API valida com ele na borda e o web importa o tipo inferido. Nunca duplique um tipo dos dois lados.
- **Dependências pelas bordas.** Regras de negócio não importam Express, Prisma ou axios diretamente. Elas recebem os dados de que precisam. Isso mantém as regras testáveis sem mocks pesados e permite trocar a infraestrutura.
- **Banco evolui por migration pequena.** Toda mudança de schema é uma migration do Prisma versionada (`pnpm --filter @vgm/api db:migrate`). Regras de integridade que o Prisma não expressa (índices parciais, `CHECK`) entram no SQL da migration. Nunca edite uma migration já aplicada: crie outra.
- **Configuração validada no boot.** Variáveis de ambiente passam pelo schema de `apps/api/src/config/env.ts`. Uma variável nova entra no schema e no `.env.example`.
- **Sem abstração antecipada.** Escalável não significa genérico. Não crie interfaces, fábricas ou camadas para um único uso. Extraia quando o segundo caso aparecer.
- **Dependências com critério.** Antes de adicionar um pacote, veja se a plataforma (Node, Zod, Prisma) já resolve. Versões compartilhadas ficam no `catalog` do `pnpm-workspace.yaml`.

## Regras de trabalho

- **O servidor é a fonte da verdade.** O cliente nunca envia regras, categorias ou resultados. Ele envia só a intenção (`{ cell, gameId }`) e o servidor decide.
- **Testes acompanham a regra.** Lógica nova em `services`, `validators` ou `utils` vem com teste ao lado (`arquivo.test.ts`), e o nome do teste descreve o comportamento em português.
- **Antes de entregar,** rode `pnpm typecheck`, `pnpm test` e `pnpm build`, todos devem passar.
- **Idioma.** Identificadores no código em inglês. Mensagens ao usuário, nomes de teste, comentários, commits e documentação em português.
- **Commits** seguem Conventional Commits (`feat(api): ...`, `fix(web): ...`, `refactor: ...`).
- **ROADMAP.** Ao concluir um item, marque-o como feito no `ROADMAP.md`.
