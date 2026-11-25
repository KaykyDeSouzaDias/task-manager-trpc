import { describe, expect, it } from "vitest";
import { taskInput } from "@/server/schemas";

describe("taskInput", () => {
  it("aceita título e descrição opcional", () => {
    expect(taskInput.safeParse({ titulo: "Ok" }).success).toBe(true);
  });

  it("rejeita título vazio ou só com espaços", () => {
    expect(taskInput.safeParse({ titulo: "" }).success).toBe(false);
    expect(taskInput.safeParse({ titulo: "   " }).success).toBe(false);
  });

  it("rejeita título acima de 100 caracteres", () => {
    expect(taskInput.safeParse({ titulo: "a".repeat(101) }).success).toBe(false);
  });
});
