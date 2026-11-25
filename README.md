# task-manager-trpc

Um gerenciador de tarefas simples feito com **Next.js 15**, **React 19** e **tRPC 11**. Implementa CRUD completo, validação de dados e comunicação tipada entre frontend e backend. As tarefas ficam **em memória**, sem banco de dados, e são perdidas quando o servidor reinicia.

> Todos os dados são fictícios. O projeto não usa variáveis de ambiente, tokens nem informações pessoais.

## Como executar

Requisitos: Node.js 20 ou superior.

```bash
npm install
npm run dev      # http://localhost:3000
```

Build de produção:

```bash
npm run build
npm start
```

Testes e verificações:

```bash
npm test             # Vitest (unitários e de componente)
npm run typecheck    # tsc --noEmit
```

Com Docker:

```bash
docker build -t task-manager-trpc .
docker run -p 3000:3000 task-manager-trpc
```

O servidor inicia com 15 tarefas de exemplo, o que permite testar o infinite scroll de imediato.

## Funcionalidades

| Requisito | Onde está |
|---|---|
| CRUD via tRPC (criar, listar, atualizar, deletar) | `src/server/routers/task.ts` |
| Validação (título obrigatório) e erros significativos | `src/server/schemas.ts` e `TRPCError` NOT_FOUND no router |
| Listagem com **SSR** | `src/app/page.tsx` |
| Exclusão na listagem com feedback de sucesso e erro | `src/components/TaskList.tsx` |
| Formulário de criar e editar com validação | `src/components/TaskForm.tsx` |
| **Bônus:** infinite scroll | `src/components/TaskList.tsx` (IntersectionObserver + `useInfiniteQuery`) |

## Estrutura

```
src/
├── app/                     # Rotas (App Router)
│   ├── page.tsx             # Listagem (SSR)
│   ├── tasks/new/           # Criar tarefa
│   ├── tasks/[id]/edit/     # Editar tarefa (SSR carrega a tarefa)
│   └── api/trpc/[trpc]/     # Handler HTTP do tRPC
├── components/              # TaskList, TaskItem, TaskForm, Alert
├── server/
│   ├── store.ts             # "Banco" em memória
│   ├── schemas.ts           # Schema zod compartilhado (backend e formulário)
│   ├── trpc.ts              # Inicialização do tRPC
│   ├── caller.ts            # Caller server-side (usado no SSR)
│   └── routers/             # task.ts (CRUD) e _app.ts (router raiz)
└── trpc/provider.tsx        # Cliente tRPC + React Query
tests/                       # Vitest: router, schema e TaskForm
Dockerfile                   # Build multi-stage (output standalone)
.github/workflows/ci.yml     # CI: typecheck, testes e build
```

## Decisões de projeto

- **Modelo da tarefa:** `id` (UUID), `titulo`, `descricao?` e `dataCriacao` (timestamp em ms). O timestamp é um número para evitar problemas de serialização de `Date`.
- **Armazenamento em memória:** o array fica em `globalThis` para sobreviver ao hot-reload do `next dev`. Sem isso, cada reload zeraria a lista.
- **SSR sem HTTP:** as páginas de servidor chamam o router direto com `createCallerFactory`. A 1ª página da lista chega no HTML e vira `initialData` do React Query, sem flash de loading. Depois disso o cliente assume via tRPC e HTTP.
- **Validação nos dois lados:** o mesmo schema zod (`src/server/schemas.ts`) valida o formulário no navegador e o input da procedure no servidor. O backend continua protegido mesmo se a validação do frontend for contornada.
- **Erros:** operações em tarefas inexistentes lançam `TRPCError({ code: "NOT_FOUND" })`. A mensagem aparece para o usuário (alerta na listagem ou no formulário), e a edição de um id inexistente cai na página 404.
- **Infinite scroll:** `task.list` usa paginação por cursor (offset) e devolve `nextCursor`. Um elemento sentinela no fim da lista, observado com `IntersectionObserver`, dispara `fetchNextPage`.
- **Cache:** após criar, editar ou excluir, as queries de listagem são invalidadas, então a lista sempre reflete o estado atual.
- **Estilo:** CSS simples em `globals.css`, sem biblioteca de UI, porque o desafio pede apenas um layout simples.

## Testes e CI

- **Router tRPC** (`tests/task-router.test.ts`): chama o router direto com `createCallerFactory`, sem HTTP. Cobre CRUD, paginação por cursor, título vazio e `NOT_FOUND`.
- **Schema** (`tests/task-schema.test.ts`): regras de validação do título.
- **Componente** (`tests/task-form.test.tsx`): Testing Library + user-event. Verifica que o formulário bloqueia o envio com título vazio e envia quando preenchido.
- **CI** (GitHub Actions): a cada push e pull request roda `typecheck`, `test` e `build`.

## Endpoints tRPC

| Procedure | Tipo | Entrada | Observações |
|---|---|---|---|
| `task.list` | query | `{ cursor?, limit? }` | Retorna `{ items, nextCursor }`, das mais novas para as mais antigas |
| `task.byId` | query | `{ id }` | `NOT_FOUND` se não existir |
| `task.create` | mutation | `{ titulo, descricao? }` | `BAD_REQUEST` sem título |
| `task.update` | mutation | `{ id, titulo, descricao? }` | `NOT_FOUND` se não existir |
| `task.delete` | mutation | `{ id }` | `NOT_FOUND` se não existir |
