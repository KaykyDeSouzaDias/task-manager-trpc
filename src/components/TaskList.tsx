"use client";

import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useTRPC, type RouterOutputs } from "@/trpc/provider";
import { Alert, type Feedback } from "./Alert";
import { TaskItem } from "./TaskItem";

type Page = RouterOutputs["task"]["list"];

/**
 * Recebe a 1ª página já carregada no servidor (SSR) e usa como `initialData`;
 * as próximas páginas são buscadas via tRPC quando o sentinel entra na tela.
 */
export function TaskList({ initialPage }: { initialPage: Page }) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [feedback, setFeedback] = useState<Feedback>(null);

  const query = useInfiniteQuery(
    trpc.task.list.infiniteQueryOptions(
      { limit: 10 },
      {
        getNextPageParam: (last) => last.nextCursor,
        initialData: { pages: [initialPage], pageParams: [null] },
      },
    ),
  );

  const remove = useMutation(
    trpc.task.delete.mutationOptions({
      onSuccess: () => {
        setFeedback({ type: "success", message: "Tarefa excluída com sucesso." });
        return queryClient.invalidateQueries(trpc.task.list.pathFilter());
      },
      onError: (err) => setFeedback({ type: "error", message: `Não foi possível excluir: ${err.message}` }),
    }),
  );

  // Infinite scroll: observa um elemento no fim da lista.
  const sentinel = useRef<HTMLDivElement>(null);
  const { hasNextPage, isFetchingNextPage, fetchNextPage } = query;
  useEffect(() => {
    const el = sentinel.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) fetchNextPage();
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const tasks = query.data.pages.flatMap((p) => p.items);

  return (
    <>
      <div className="row">
        <h1>Tarefas</h1>
        <Link className="btn btn-primary" href="/tasks/new">+ Nova tarefa</Link>
      </div>

      <Alert feedback={feedback} />
      {query.isError && (
        <Alert feedback={{ type: "error", message: `Erro ao carregar tarefas: ${query.error.message}` }} />
      )}

      {tasks.length === 0 ? (
        <p className="muted">Nenhuma tarefa cadastrada.</p>
      ) : (
        <ul className="list">
          {tasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              deleting={remove.isPending && remove.variables?.id === task.id}
              onDelete={() => {
                setFeedback(null);
                remove.mutate({ id: task.id });
              }}
            />
          ))}
        </ul>
      )}

      <div ref={sentinel} className="muted">
        {isFetchingNextPage ? "Carregando mais..." : !hasNextPage && tasks.length > 0 ? "Fim da lista" : ""}
      </div>
    </>
  );
}
