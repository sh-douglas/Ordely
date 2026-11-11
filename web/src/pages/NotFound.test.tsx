import { expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import App from "../App";

it.each(["/pagina-inexistente", "/painel/pagina-inexistente"])(
  "mostra a página 404 com saídas úteis para %s",
  (path) => {
    render(
      <MemoryRouter initialEntries={[path]}>
        <App />
      </MemoryRouter>,
    );
    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "Esse endereço saiu do cardápio.",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Voltar ao cardápio" }),
    ).toHaveAttribute("href", "/");
    expect(
      screen.getByRole("link", { name: "Acessar área da equipe" }),
    ).toHaveAttribute("href", "/entrar");
    expect(
      screen.getAllByRole("link", { name: "Acompanhar pedido" }),
    ).toHaveLength(2);
  },
);

it("permite sair da página 404 para consultar o pedido", async () => {
  const user = userEvent.setup();
  render(
    <MemoryRouter initialEntries={["/pagina-inexistente"]}>
      <App />
    </MemoryRouter>,
  );
  await user.click(
    screen.getAllByRole("link", { name: "Acompanhar pedido" })[1]!,
  );
  expect(screen.getByRole("textbox", { name: /Código de acompanhamento/ })).toBeInTheDocument();
  expect(
    screen.queryByRole("heading", { name: "Esse endereço saiu do cardápio." }),
  ).not.toBeInTheDocument();
});
