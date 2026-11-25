export type Feedback = { type: "success" | "error"; message: string } | null;

export function Alert({ feedback }: { feedback: Feedback }) {
  if (!feedback) return null;
  return (
    <div className={`alert alert-${feedback.type}`} role={feedback.type === "error" ? "alert" : "status"}>
      {feedback.message}
    </div>
  );
}
