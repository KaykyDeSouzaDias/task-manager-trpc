import { z } from "zod";

// Schema de validação compartilhado: o backend (tRPC) e o formulário usam a mesma regra.
export const taskInput = z.object({
  titulo: z.string().trim().min(1, "O título é obrigatório").max(100, "Máximo de 100 caracteres"),
  descricao: z.string().trim().max(500, "Máximo de 500 caracteres").optional(),
});
