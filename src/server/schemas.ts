import { z } from "zod";

// Shared validation schema: the backend (tRPC) and the form use the same rules.
export const taskInput = z.object({
  titulo: z.string().trim().min(1, "Title is required").max(100, "Maximum of 100 characters"),
  descricao: z.string().trim().max(500, "Maximum of 500 characters").optional(),
});
