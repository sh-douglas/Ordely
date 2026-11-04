import axios from "axios";
import { z } from "zod";
const url = import.meta.env.VITE_API_URL || "http://localhost:5000";
export const api = axios.create({
  baseURL: url.replace(/\/$/, ""),
  timeout: 15000,
});
export const tokenKey = "ordely.session";
export function setToken(token: string | null) {
  if (token) {
    sessionStorage.setItem(tokenKey, token);
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    sessionStorage.removeItem(tokenKey);
    delete api.defaults.headers.common.Authorization;
  }
}
const saved = sessionStorage.getItem(tokenKey);
if (saved) api.defaults.headers.common.Authorization = `Bearer ${saved}`;
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error.response?.status === 401 &&
      error.config?.headers?.Authorization &&
      error.config?.url !== "/auth/signin"
    ) {
      setToken(null);
      window.dispatchEvent(new Event("ordely:unauthorized"));
    }
    return Promise.reject(error);
  },
);
const messages: Record<string, string> = {
  "Invalid credentials.": "E-mail ou senha incorretos.",
  "Invalid or expired token.": "Sua sessão expirou. Entre novamente.",
  "Unauthorized.": "Entre na sua conta para continuar.",
  "Order not found.": "Pedido não encontrado. Confira o código informado.",
  "Product not found.": "Produto não encontrado.",
  "Category not found.": "Categoria não encontrada.",
  "One or more products were not found.":
    "Um produto do pedido não existe mais. Atualize o cardápio.",
  "One or more products are unavailable.":
    "Um produto ficou indisponível. Atualize o cardápio antes de continuar.",
  "Invalid order status transition.":
    "O pedido mudou de status. Atualize a lista e tente novamente.",
  "This category already exists.": "Essa categoria já existe.",
  "Email already in use.": "Este e-mail já está cadastrado.",
  "Origin is not allowed.": "Acesso não permitido para este endereço.",
};
export function errorMessage(error: unknown): string {
  if (error instanceof z.ZodError)
    return error.issues[0]?.message || "Confira os campos informados.";
  if (axios.isAxiosError(error)) {
    if (!error.response)
      return "Não foi possível conectar. Confira sua conexão e tente novamente.";
    const message = error.response.data?.error;
    return (
      messages[message] ||
      (error.response.status >= 500
        ? "O serviço está indisponível no momento. Tente novamente em instantes."
        : "Não foi possível concluir. Confira os dados e tente novamente.")
    );
  }
  return "Não foi possível concluir esta ação. Tente novamente.";
}
