"use client";

import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useTRPC, type RouterOutputs } from "@/trpc/provider";
import { Alert, type Feedback } from "./Alert";
import { TaskItem } from "./TaskItem";

type Page = RouterOutputs["task"]["list"];

/**
 * Receives the first page already loaded on the server (SSR) and uses it as `initialData`;
 * the next pages are fetched via tRPC when the sentinel enters the viewport.
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
        setFeedback({ type: "success", message: "Task deleted successfully." });
        return queryClient.invalidateQueries(trpc.task.list.pathFilter());
      },
      onError: (err) => setFeedback({ type: "error", message: `Could not delete: ${err.message}` }),
    }),
  );

  // Infinite scroll: watches an element at the end of the list.
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
        <h1>Tasks</h1>
        <Link className="btn btn-primary" href="/tasks/new">+ New task</Link>
      </div>

      <Alert feedback={feedback} />
      {query.isError && (
        <Alert feedback={{ type: "error", message: `Error loading tasks: ${query.error.message}` }} />
      )}

      {tasks.length === 0 ? (
        <p className="muted">No tasks yet.</p>
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
        {isFetchingNextPage ? "Loading more..." : !hasNextPage && tasks.length > 0 ? "End of list" : ""}
      </div>
    </>
  );
}
