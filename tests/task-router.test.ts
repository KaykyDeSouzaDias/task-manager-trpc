import { TRPCError } from "@trpc/server";
import { beforeEach, describe, expect, it } from "vitest";
import { appRouter } from "@/server/routers/_app";
import { tasks } from "@/server/store";
import { createCallerFactory } from "@/server/trpc";

const api = createCallerFactory(appRouter)({});

// Each test starts with an empty in-memory "database".
beforeEach(() => {
  tasks.length = 0;
});

describe("task router", () => {
  it("creates a task with generated id and dataCriacao", async () => {
    const task = await api.task.create({ titulo: "  Study  ", descricao: "something" });
    expect(task).toMatchObject({ titulo: "Study", descricao: "something" });
    expect(task.id).toBeTruthy();
    expect(typeof task.dataCriacao).toBe("number");
  });

  it("does not create a task without a title", async () => {
    await expect(api.task.create({ titulo: "   " })).rejects.toThrow(/Title is required/);
  });

  it("lists with cursor pagination, newest first", async () => {
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

  it("updates an existing task", async () => {
    const { id } = await api.task.create({ titulo: "Before" });
    const updated = await api.task.update({ id, titulo: "After" });
    expect(updated.titulo).toBe("After");
    expect((await api.task.byId({ id })).titulo).toBe("After");
  });

  it("deletes a task", async () => {
    const { id } = await api.task.create({ titulo: "Remove" });
    await api.task.delete({ id });
    expect(tasks).toHaveLength(0);
  });

  it.each([
    ["byId", (id: string) => api.task.byId({ id })],
    ["update", (id: string) => api.task.update({ id, titulo: "x" })],
    ["delete", (id: string) => api.task.delete({ id })],
  ])("%s on a missing task returns NOT_FOUND", async (_name, call) => {
    const err = await call("does-not-exist").catch((e) => e);
    expect(err).toBeInstanceOf(TRPCError);
    expect(err.code).toBe("NOT_FOUND");
  });
});
