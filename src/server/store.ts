import { randomUUID } from "node:crypto";

export type Task = {
  id: string;
  titulo: string;
  descricao?: string;
  dataCriacao: number; // timestamp (ms)
};

/**
 * "Banco" em memória. Fica em globalThis para sobreviver ao hot-reload do
 * `next dev` (sem isso o módulo seria reavaliado e a lista zerada).
 * Os dados são perdidos ao reiniciar o servidor, como pede o desafio.
 */
const g = globalThis as unknown as { __tasks?: Task[] };

function seed(): Task[] {
  const now = Date.now();
  return Array.from({ length: 15 }, (_, i) => ({
    id: randomUUID(),
    titulo: `Tarefa de exemplo ${i + 1}`,
    descricao: i % 3 === 0 ? undefined : `Descrição fictícia da tarefa ${i + 1}.`,
    dataCriacao: now - i * 60_000,
  }));
}

export const tasks: Task[] = (g.__tasks ??= seed());
