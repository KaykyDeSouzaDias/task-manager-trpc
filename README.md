# task-manager-trpc

A simple task manager built with **Next.js 15**, **React 19** and **tRPC 11**. It implements full CRUD, data validation and type-safe communication between frontend and backend. Tasks are stored **in memory**, with no database, and are lost when the server restarts.

> All data is fictional. The project uses no environment variables, tokens or personal information.

## Running the project

Requirements: Node.js 20 or higher.

```bash
npm install
npm run dev      # http://localhost:3000
```

Production build:

```bash
npm run build
npm start
```

Tests and checks:

```bash
npm test             # Vitest (unit and component tests)
npm run typecheck    # tsc --noEmit
```

With Docker:

```bash
docker build -t task-manager-trpc .
docker run -p 3000:3000 task-manager-trpc
```

The server starts with 15 sample tasks, so infinite scroll can be tried right away.

## Features

| Requirement | Where |
|---|---|
| CRUD via tRPC (create, list, update, delete) | `src/server/routers/task.ts` |
| Validation (required title) and meaningful errors | `src/server/schemas.ts` and `TRPCError` NOT_FOUND in the router |
| List page with **SSR** | `src/app/page.tsx` |
| Delete from the list with success and error feedback | `src/components/TaskList.tsx` |
| Create and edit form with validation | `src/components/TaskForm.tsx` |
| **Bonus:** infinite scroll | `src/components/TaskList.tsx` (IntersectionObserver + `useInfiniteQuery`) |

## Structure

```
src/
├── app/                     # Routes (App Router)
│   ├── page.tsx             # List page (SSR)
│   ├── tasks/new/           # Create task
│   ├── tasks/[id]/edit/     # Edit task (SSR loads the task)
│   └── api/trpc/[trpc]/     # tRPC HTTP handler
├── components/              # TaskList, TaskItem, TaskForm, Alert
├── server/
│   ├── store.ts             # In-memory "database"
│   ├── schemas.ts           # Shared zod schema (backend and form)
│   ├── trpc.ts              # tRPC initialization
│   ├── caller.ts            # Server-side caller (used for SSR)
│   └── routers/             # task.ts (CRUD) and _app.ts (root router)
└── trpc/provider.tsx        # tRPC client + React Query
tests/                       # Vitest: router, schema and TaskForm
Dockerfile                   # Multi-stage build (standalone output)
.github/workflows/ci.yml     # CI: typecheck, tests and build
```

## Design decisions

- **Task model:** `id` (UUID), `titulo`, `descricao?` and `dataCriacao` (timestamp in ms). The field names follow the challenge specification. The timestamp is a number to avoid `Date` serialization issues.
- **In-memory storage:** the array lives on `globalThis` to survive hot-reload in `next dev`. Without it, every reload would reset the list.
- **SSR without HTTP:** server pages call the router directly with `createCallerFactory`. The first page of the list arrives in the HTML and becomes React Query's `initialData`, with no loading flash. After that, the client takes over through tRPC over HTTP.
- **Validation on both sides:** the same zod schema (`src/server/schemas.ts`) validates the form in the browser and the procedure input on the server. The backend stays protected even if the frontend validation is bypassed.
- **Errors:** operations on non-existent tasks throw `TRPCError({ code: "NOT_FOUND" })`. The message is shown to the user (an alert on the list or in the form), and editing a non-existent id falls into the 404 page.
- **Infinite scroll:** `task.list` uses cursor (offset) pagination and returns `nextCursor`. A sentinel element at the end of the list, observed with `IntersectionObserver`, triggers `fetchNextPage`.
- **Cache:** after creating, editing or deleting, the list queries are invalidated, so the list always reflects the current state.
- **Styling:** plain CSS in `globals.css`, with no UI library, since the challenge only asks for a simple layout.

## Tests and CI

- **tRPC router** (`tests/task-router.test.ts`): calls the router directly with `createCallerFactory`, without HTTP. Covers CRUD, cursor pagination, empty title and `NOT_FOUND`.
- **Schema** (`tests/task-schema.test.ts`): title validation rules.
- **Component** (`tests/task-form.test.tsx`): Testing Library + user-event. Checks that the form blocks submission with an empty title and submits when filled.
- **CI** (GitHub Actions): on every push and pull request it runs `typecheck`, `test` and `build`.

## tRPC endpoints

| Procedure | Type | Input | Notes |
|---|---|---|---|
| `task.list` | query | `{ cursor?, limit? }` | Returns `{ items, nextCursor }`, newest first |
| `task.byId` | query | `{ id }` | `NOT_FOUND` if it does not exist |
| `task.create` | mutation | `{ titulo, descricao? }` | `BAD_REQUEST` without a title |
| `task.update` | mutation | `{ id, titulo, descricao? }` | `NOT_FOUND` if it does not exist |
| `task.delete` | mutation | `{ id }` | `NOT_FOUND` if it does not exist |
