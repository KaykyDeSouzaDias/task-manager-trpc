import { randomUUID } from "node:crypto";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { publicProcedure, router } from "../trpc";
import { taskInput } from "../schemas";
import { tasks, type Task } from "../store";

const notFound = (id: string) =>
  new TRPCError({ code: "NOT_FOUND", message: `Task "${id}" not found` });

const find = (id: string) => {
  const task = tasks.find((t) => t.id === id);
  if (!task) throw notFound(id);
  return task;
};

export const taskRouter = router({
  // Cursor (offset) pagination — feeds the infinite scroll. Newest first.
  list: publicProcedure
    .input(
      z.object({
        cursor: z.number().int().min(0).nullish(), // the tRPC client sends null on the first page
        limit: z.number().int().min(1).max(50).default(10),
      }),
    )
    .query(({ input }) => {
      const start = input.cursor ?? 0;
      const sorted = [...tasks].sort((a, b) => b.dataCriacao - a.dataCriacao);
      const items = sorted.slice(start, start + input.limit);
      const next = start + items.length;
      return { items, nextCursor: next < sorted.length ? next : undefined };
    }),

  byId: publicProcedure.input(z.object({ id: z.string() })).query(({ input }) => find(input.id)),

  create: publicProcedure.input(taskInput).mutation(({ input }): Task => {
    const task: Task = {
      id: randomUUID(),
      titulo: input.titulo,
      descricao: input.descricao || undefined,
      dataCriacao: Date.now(),
    };
    tasks.push(task);
    return task;
  }),

  update: publicProcedure
    .input(taskInput.extend({ id: z.string() }))
    .mutation(({ input }): Task => {
      const task = find(input.id);
      task.titulo = input.titulo;
      task.descricao = input.descricao || undefined;
      return task;
    }),

  delete: publicProcedure.input(z.object({ id: z.string() })).mutation(({ input }) => {
    const task = find(input.id);
    tasks.splice(tasks.indexOf(task), 1);
    return { id: input.id };
  }),
});
