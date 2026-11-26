import { describe, expect, it } from "vitest";
import { taskInput } from "@/server/schemas";

describe("taskInput", () => {
  it("accepts a title and optional description", () => {
    expect(taskInput.safeParse({ titulo: "Ok" }).success).toBe(true);
  });

  it("rejects an empty or whitespace-only title", () => {
    expect(taskInput.safeParse({ titulo: "" }).success).toBe(false);
    expect(taskInput.safeParse({ titulo: "   " }).success).toBe(false);
  });

  it("rejects a title over 100 characters", () => {
    expect(taskInput.safeParse({ titulo: "a".repeat(101) }).success).toBe(false);
  });
});
