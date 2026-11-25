import { TRPCError } from "@trpc/server";
import { beforeEach, describe, expect, it } from "vitest";
import { appRouter } from "@/server/routers/_app";
import { tasks } from "@/server/store";
import { createCallerFactory } from "@/server/trpc";

const api = createCallerFactory(appRouter)({});

// Cada teste começa com o "banco" em memória vazio.
beforeEach(() => {
  tasks.length = 0;
});

describe("task router", () => {
  it("cria tarefa com id e dataCriacao gerados", async () => {
    const task = await api.task.create({ titulo: "  Estudar  ", descricao: "algo" });
    expect(task).toMatchObject({ titulo: "Estudar", descricao: "algo" });
    expect(task.id).toBeTruthy();
    expect(typeof task.dataCriacao).toBe("number");
  });

  it("não cria tarefa sem título", async () => {
    await expect(api.task.create({ titulo: "   " })).rejects.toThrow(/título é obrigatório/);
  });

  it("lista com paginação por cursor, das mais novas para as mais antigas", async () => {
    for (let i = 1; i <= 5; i++) {
      tasks.push({ id: `${i}`, titulo: `T${i}`, dataCriacao: i });
    }
    const page1 = await api.task.list({ limit: 2 });
    expect(page1.items.map((t) => t.titulo)).toEqual(["T5", "T4"]);
    expect(page1.nextCursor).toBe(2);

    const page3 = await api.task.list({ limit: 2, cursor: 4 });
    expect(page3.items.map((t) => t.titulo)).toEqual(["T1"]);
    expect(page3.nextCursor).toBeUndefined();
  });

  it("atualiza uma tarefa existente", async () => {
    const { id } = await api.task.create({ titulo: "Antes" });
    const updated = await api.task.update({ id, titulo: "Depois" });
    expect(updated.titulo).toBe("Depois");
    expect((await api.task.byId({ id })).titulo).toBe("Depois");
  });

  it("remove uma tarefa", async () => {
    const { id } = await api.task.create({ titulo: "Remover" });
    await api.task.delete({ id });
    expect(tasks).toHaveLength(0);
  });

  it.each([
    ["byId", (id: string) => api.task.byId({ id })],
    ["update", (id: string) => api.task.update({ id, titulo: "x" })],
    ["delete", (id: string) => api.task.delete({ id })],
  ])("%s de tarefa inexistente retorna NOT_FOUND", async (_name, call) => {
    const err = await call("nao-existe").catch((e) => e);
    expect(err).toBeInstanceOf(TRPCError);
    expect(err.code).toBe("NOT_FOUND");
  });
});
