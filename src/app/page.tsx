import { TaskList } from "@/components/TaskList";
import { serverApi } from "@/server/caller";

// Sempre renderiza no servidor a cada request (SSR) — os dados mudam em memória.
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const initialPage = await serverApi.task.list({ limit: 10 });
  return <TaskList initialPage={initialPage} />;
}
