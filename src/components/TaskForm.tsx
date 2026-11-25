"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { taskInput } from "@/server/schemas";
import type { Task } from "@/server/store";
import { useTRPC } from "@/trpc/provider";
import { Alert } from "./Alert";

/** Formulário único para criar (sem `task`) e editar (com `task`). */
export function TaskForm({ task }: { task?: Task }) {
  const trpc = useTRPC();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [titulo, setTitulo] = useState(task?.titulo ?? "");
  const [descricao, setDescricao] = useState(task?.descricao ?? "");
  const [errors, setErrors] = useState<{ titulo?: string; descricao?: string }>({});

  const onSuccess = async () => {
    await queryClient.invalidateQueries(trpc.task.pathFilter());
    router.push("/");
  };
  const create = useMutation(trpc.task.create.mutationOptions({ onSuccess }));
  const update = useMutation(trpc.task.update.mutationOptions({ onSuccess }));
  const mutation = task ? update : create;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Validação no frontend com o mesmo schema usado pelo backend.
    const parsed = taskInput.safeParse({ titulo, descricao: descricao || undefined });
    if (!parsed.success) {
      const fields = parsed.error.flatten().fieldErrors;
      setErrors({ titulo: fields.titulo?.[0], descricao: fields.descricao?.[0] });
      return;
    }
    setErrors({});
    if (task) update.mutate({ id: task.id, ...parsed.data });
    else create.mutate(parsed.data);
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <h1>{task ? "Editar tarefa" : "Nova tarefa"}</h1>

      {mutation.isError && (
        <Alert feedback={{ type: "error", message: `Erro: ${mutation.error.message}` }} />
      )}

      <div className="field" style={{ marginTop: 20 }}>
        <label htmlFor="titulo">Título *</label>
        <input
          id="titulo"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          className={errors.titulo ? "invalid" : ""}
          aria-invalid={!!errors.titulo}
        />
        {errors.titulo && <span className="error-text">{errors.titulo}</span>}
      </div>

      <div className="field">
        <label htmlFor="descricao">Descrição</label>
        <textarea
          id="descricao"
          rows={4}
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
          className={errors.descricao ? "invalid" : ""}
        />
        {errors.descricao && <span className="error-text">{errors.descricao}</span>}
      </div>

      <div className="actions">
        <button className="btn btn-primary" type="submit" disabled={mutation.isPending || mutation.isSuccess}>
          {mutation.isPending ? "Salvando..." : task ? "Salvar alterações" : "Criar tarefa"}
        </button>
        <Link className="btn" href="/">Cancelar</Link>
      </div>
    </form>
  );
}
