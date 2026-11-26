import { TaskList } from "@/components/TaskList";
import { serverApi } from "@/server/caller";

// Always rendered on the server on every request (SSR) — the in-memory data changes.
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const initialPage = await serverApi.task.list({ limit: 10 });
  return <TaskList initialPage={initialPage} />;
}
