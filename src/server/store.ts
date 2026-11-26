import { randomUUID } from "node:crypto";

export type Task = {
  id: string;
  titulo: string;
  descricao?: string;
  dataCriacao: number; // timestamp (ms)
};

/**
 * In-memory "database". Kept on globalThis so it survives hot-reload in
 * `next dev` (otherwise the module would be re-evaluated and the list reset).
 * Data is lost when the server restarts, as the challenge requires.
 */
const g = globalThis as unknown as { __tasks?: Task[] };

function seed(): Task[] {
  const now = Date.now();
  return Array.from({ length: 15 }, (_, i) => ({
    id: randomUUID(),
    titulo: `Sample task ${i + 1}`,
    descricao: i % 3 === 0 ? undefined : `Fictional description for task ${i + 1}.`,
    dataCriacao: now - i * 60_000,
  }));
}

export const tasks: Task[] = (g.__tasks ??= seed());
