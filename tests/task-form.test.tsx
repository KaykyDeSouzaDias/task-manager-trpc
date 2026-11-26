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
  it("shows an error and does not submit when the title is empty", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    renderForm();

    await userEvent.click(screen.getByRole("button", { name: "Create task" }));

    expect(await screen.findByText("Title is required")).toBeInTheDocument();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("clears the error and submits when the title is filled", async () => {
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(new Response(JSON.stringify([{ result: { data: { id: "1" } } }])));
    renderForm();

    await userEvent.type(screen.getByLabelText(/Title/), "New task");
    await userEvent.click(screen.getByRole("button", { name: "Create task" }));

    expect(screen.queryByText("Title is required")).not.toBeInTheDocument();
    expect(fetchSpy).toHaveBeenCalled();
  });
});
