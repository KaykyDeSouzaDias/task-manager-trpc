import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { TaskForm } from "@/components/TaskForm";
import { Providers } from "@/trpc/provider";

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));
vi.mock("next/link", () => ({
  default: ({ href, children, ...rest }: { href: string; children: React.ReactNode }) => (
    <a href={href} {...rest}>{children}</a>
  ),
}));

const renderForm = () =>
  render(
    <Providers>
      <TaskForm />
    </Providers>,
  );

describe("TaskForm", () => {
  it("mostra erro e não envia quando o título está vazio", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    renderForm();

    await userEvent.click(screen.getByRole("button", { name: "Criar tarefa" }));

    expect(await screen.findByText("O título é obrigatório")).toBeInTheDocument();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("limpa o erro e envia quando o título é preenchido", async () => {
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(new Response(JSON.stringify([{ result: { data: { id: "1" } } }])));
    renderForm();

    await userEvent.type(screen.getByLabelText(/Título/), "Nova tarefa");
    await userEvent.click(screen.getByRole("button", { name: "Criar tarefa" }));

    expect(screen.queryByText("O título é obrigatório")).not.toBeInTheDocument();
    expect(fetchSpy).toHaveBeenCalled();
  });
});
