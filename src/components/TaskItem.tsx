import Link from "next/link";
import type { Task } from "@/server/store";

export function TaskItem({
  task,
  deleting,
  onDelete,
}: {
  task: Task;
  deleting: boolean;
  onDelete: () => void;
}) {
  return (
    <li className="card row">
      <div>
        <h2>{task.titulo}</h2>
        {task.descricao && <p>{task.descricao}</p>}
        <small>Created on {new Date(task.dataCriacao).toLocaleString("en-US")}</small>
      </div>
      <div className="actions">
        <Link className="btn" href={`/tasks/${task.id}/edit`}>Edit</Link>
        <button className="btn btn-danger" onClick={onDelete} disabled={deleting}>
          {deleting ? "Deleting..." : "Delete"}
        </button>
      </div>
    </li>
  );
}
