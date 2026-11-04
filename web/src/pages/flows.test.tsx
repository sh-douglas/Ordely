import { beforeEach, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes, useLocation } from "react-router";
import { api, setToken } from "../lib/api";
import { AuthProvider, Protected } from "../lib/auth";
import Menu from "./Menu";
import Orders from "./Orders";
import Tracking from "./Tracking";
import Login from "./Login";
import Inventory from "./Inventory";
import { Categories, Team } from "./Management";
const id = "a011a0d5-1ac1-4df0-a1d0-000000000002";
const category = {
  id: "a011a0d5-1ac1-4df0-a1d0-000000000003",
  name: "Lanches",
};
const product = {
  id,
  name: "Sanduíche da casa",
  price: "18.50",
  available: true,
  categoryId: category.id,
  category,
};
const order = {
  id: 1,
  status: "PENDING",
  customerName: "Maria",
  createdAt: "2026-11-03T12:00:00Z",
  paymentMethod: "PIX",
  total: "18.50",
  orderItems: [{ quantity: 1, unitPrice: "18.50", product }],
};
beforeEach(() => {
  vi.restoreAllMocks();
  setToken(null);
  vi.spyOn(api, "get").mockImplementation(async (path) => ({
    data:
      path === "/categories"
        ? [category]
        : path === "/products/menu" || path === "/products/inventory"
          ? [product]
          : path === "/orders"
            ? [order]
            : path === "/orders/history"
              ? []
              : path.startsWith("/orders/track/")
                ? order
                : { id, name: "Funcionário", email: "a@example.com" },
  }));
  vi.spyOn(api, "post").mockResolvedValue({
    data: { id: 1, trackingCode: id },
  });
  vi.spyOn(api, "patch").mockResolvedValue({ data: {} });
});
function Location() {
  return <div>{useLocation().pathname}</div>;
}
function wrap(node: React.ReactNode) {
  return render(<MemoryRouter>{node}</MemoryRouter>);
}
it("monta a sacola, valida o checkout e navega para o rastreamento retornado", async () => {
  const user = userEvent.setup();
  wrap(
    <>
      <Menu />
      <Location />
    </>,
  );
  await user.click(
    await screen.findByRole("button", { name: "Adicionar Sanduíche da casa" }),
  );
  await user.click(screen.getByRole("button", { name: "Continuar pedido" }));
  await user.type(screen.getByLabelText("Seu nome"), "Maria");
  await user.type(screen.getByLabelText("Celular com DDD"), "(11) 99999-9999");
  await user.click(screen.getByRole("button", { name: "Enviar pedido" }));
  await waitFor(() =>
    expect(api.post).toHaveBeenCalledWith("/orders", {
      customerName: "Maria",
      customerPhone: "11999999999",
      paymentMethod: "PIX",
      items: [{ productId: id, quantity: 1 }],
    }),
  );
  expect(await screen.findByText(`/acompanhar/${id}`)).toBeInTheDocument();
});
it("não envia checkout inválido", async () => {
  const user = userEvent.setup();
  wrap(<Menu />);
  await user.click(
    await screen.findByRole("button", { name: "Adicionar Sanduíche da casa" }),
  );
  await user.click(screen.getByRole("button", { name: "Continuar pedido" }));
  await user.type(screen.getByLabelText("Seu nome"), "Maria");
  await user.type(screen.getByLabelText("Celular com DDD"), "123");
  await user.click(screen.getByRole("button", { name: "Enviar pedido" }));
  expect(await screen.findByRole("alert")).toHaveTextContent("11 dígitos");
  expect(api.post).not.toHaveBeenCalled();
});
it("filtra produtos e apresenta estado vazio", async () => {
  const user = userEvent.setup();
  wrap(<Menu />);
  await screen.findByText("Sanduíche da casa");
  await user.type(
    screen.getByRole("textbox", { name: "Buscar no cardápio" }),
    "inexistente",
  );
  expect(screen.getByText("Nenhum resultado por aqui")).toBeInTheDocument();
});
it("protege o painel sem sessão", async () => {
  render(
    <MemoryRouter initialEntries={["/painel"]}>
      <AuthProvider>
        <Routes>
          <Route
            path="/painel"
            element={
              <Protected>
                <div>Painel privado</div>
              </Protected>
            }
          />
          <Route path="/entrar" element={<div>Login necessário</div>} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>,
  );
  expect(await screen.findByText("Login necessário")).toBeInTheDocument();
  expect(screen.queryByText("Painel privado")).not.toBeInTheDocument();
});
it("autentica e mantém o token apenas na sessão", async () => {
  vi.mocked(api.post).mockResolvedValue({
    data: {
      token: "test-token",
      employee: { id, name: "Maria", email: "maria@example.com" },
    },
  });
  const user = userEvent.setup();
  wrap(
    <AuthProvider>
      <Login />
    </AuthProvider>,
  );
  await user.type(screen.getByLabelText("E-mail"), "maria@example.com");
  await user.type(screen.getByLabelText("Senha"), "secret123");
  await user.click(screen.getByRole("button", { name: "Entrar no painel" }));
  await waitFor(() =>
    expect(sessionStorage.getItem("ordely.session")).toBe("test-token"),
  );
  expect(api.post).toHaveBeenCalledWith("/auth/signin", {
    email: "maria@example.com",
    password: "secret123",
  });
});
it("permite iniciar preparo sem oferecer transição inválida", async () => {
  const user = userEvent.setup();
  wrap(<Orders />);
  await user.click(
    await screen.findByRole("button", { name: "Iniciar preparo" }),
  );
  await waitFor(() =>
    expect(api.patch).toHaveBeenCalledWith("/orders/1/status", {
      status: "IN_PROGRESS",
    }),
  );
  expect(
    screen.queryByRole("button", { name: "Confirmar retirada" }),
  ).not.toBeInTheDocument();
});
it("exige confirmação antes de cancelar", async () => {
  const user = userEvent.setup();
  wrap(<Orders />);
  await user.click(
    await screen.findByRole("button", { name: "Cancelar pedido" }),
  );
  expect(api.patch).not.toHaveBeenCalled();
  await user.click(screen.getByRole("button", { name: "Sim, cancelar" }));
  await waitFor(() =>
    expect(api.patch).toHaveBeenCalledWith("/orders/1/status", {
      status: "CANCELED",
    }),
  );
});
it("altera disponibilidade usando o UUID do produto", async () => {
  const user = userEvent.setup();
  wrap(<Inventory />);
  await user.click(
    await screen.findByRole("switch", {
      name: "Disponibilidade de Sanduíche da casa",
    }),
  );
  expect(api.patch).toHaveBeenCalledWith(`/products/${id}/availability`, {
    available: false,
  });
});
it("cadastra produto com preço e opcionais compatíveis com a API", async () => {
  const user = userEvent.setup();
  wrap(<Inventory />);
  await user.click(screen.getByRole("button", { name: "Novo produto" }));
  await user.type(screen.getByLabelText("Nome"), "Novo lanche");
  await user.type(screen.getByLabelText("Preço (R$)"), "25,90");
  await user.selectOptions(screen.getByLabelText("Categoria"), category.id);
  await user.click(screen.getByRole("button", { name: "Salvar produto" }));
  await waitFor(() =>
    expect(api.post).toHaveBeenCalledWith("/products", {
      name: "Novo lanche",
      price: "25.90",
      categoryId: category.id,
      description: undefined,
      imageUrl: undefined,
    }),
  );
});
it("cadastra categoria e funcionário com validação de senha", async () => {
  const user = userEvent.setup();
  const view = wrap(<Categories />);
  await user.type(screen.getByLabelText("Nome da categoria"), "Bebidas");
  await user.click(screen.getByRole("button", { name: "Cadastrar categoria" }));
  await waitFor(() =>
    expect(api.post).toHaveBeenCalledWith("/categories", { name: "Bebidas" }),
  );
  view.unmount();
  wrap(<Team />);
  await user.type(screen.getByLabelText("Nome"), "Maria");
  await user.type(screen.getByLabelText("E-mail"), "maria@example.com");
  await user.type(screen.getByLabelText("Senha", { exact: true }), "secret123");
  await user.type(screen.getByLabelText("Confirmar senha"), "secret123");
  await user.click(screen.getByRole("button", { name: "Criar acesso" }));
  await waitFor(() =>
    expect(api.post).toHaveBeenCalledWith("/auth/signup", {
      name: "Maria",
      email: "maria@example.com",
      password: "secret123",
      confirmPassword: "secret123",
    }),
  );
});
it("consulta acompanhamento público e mostra itens e status", async () => {
  render(
    <MemoryRouter initialEntries={[`/acompanhar/${id}`]}>
      <Routes>
        <Route path="/acompanhar/:code" element={<Tracking />} />
      </Routes>
    </MemoryRouter>,
  );
  expect(await screen.findByText("1 × Sanduíche da casa")).toBeInTheDocument();
  expect(api.get).toHaveBeenCalledWith(
    `/orders/track/${id}`,
    expect.anything(),
  );
});
it("informa falha da API sem mostrar produtos fictícios", async () => {
  vi.mocked(api.get).mockRejectedValue(new Error("offline"));
  wrap(<Menu />);
  expect(await screen.findByRole("alert")).toBeInTheDocument();
  expect(screen.queryByText("Sanduíche da casa")).not.toBeInTheDocument();
});
