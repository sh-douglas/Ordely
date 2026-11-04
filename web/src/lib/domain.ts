import { z } from "zod";
export type Category = { id: string; name: string };
export type Product = {
  id: string;
  name: string;
  description?: string | null;
  imageUrl?: string | null;
  price: string;
  available: boolean;
  categoryId: string;
  category?: Category;
};
export type Employee = { id: string; name: string; email: string };
export const statuses = [
  "PENDING",
  "IN_PROGRESS",
  "READY",
  "COMPLETED",
  "CANCELED",
] as const;
export type Status = (typeof statuses)[number];
export const statusLabel: Record<Status, string> = {
  PENDING: "Recebido",
  IN_PROGRESS: "Em preparo",
  READY: "Pronto para retirar",
  COMPLETED: "Concluído",
  CANCELED: "Cancelado",
};
export const transitions: Record<Status, Status[]> = {
  PENDING: ["IN_PROGRESS", "CANCELED"],
  IN_PROGRESS: ["READY", "CANCELED"],
  READY: ["COMPLETED"],
  COMPLETED: [],
  CANCELED: [],
};
export const paymentLabel = {
  PIX: "Pix",
  CASH: "Dinheiro",
  DEBIT_CARD: "Cartão de débito",
  CREDIT_CARD: "Cartão de crédito",
};
export type Payment = keyof typeof paymentLabel;
export type Order = {
  id: number;
  customerName: string;
  customerPhone?: string;
  status: Status;
  paymentMethod: Payment;
  total: string;
  createdAt: string;
  trackingCode?: string;
  orderItems?: {
    quantity: number;
    unitPrice: string;
    product: { name: string; price: string };
  }[];
};
export type CartLine = { product: Product; quantity: number };
export const money = (value: string | number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
    Number(value),
  );
export const dateTime = (value: string) =>
  new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
export const cartTotal = (lines: CartLine[]) =>
  lines.reduce(
    (sum, line) =>
      sum + Math.round(Number(line.product.price) * 100) * line.quantity,
    0,
  ) / 100;
const name = z.string().trim().min(3, "Informe pelo menos 3 caracteres.");
export const loginSchema = z.object({
  email: z.string().trim().email("Informe um e-mail válido."),
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres."),
});
export const employeeSchema = loginSchema
  .extend({ name, confirmPassword: z.string() })
  .refine((v) => v.password === v.confirmPassword, {
    path: ["confirmPassword"],
    message: "As senhas precisam ser iguais.",
  });
export const categorySchema = z.object({
  name: name.max(50, "Use até 50 caracteres."),
});
export const productSchema = z.object({
  name: name.max(100, "Use até 100 caracteres."),
  description: z
    .string()
    .trim()
    .max(150, "Use até 150 caracteres.")
    .transform((v) => v || undefined),
  price: z
    .string()
    .trim()
    .transform((v) => v.replace(",", "."))
    .pipe(
      z
        .string()
        .regex(
          /^(0|[1-9]\d{0,7})(\.\d{1,2})?$/,
          "Informe um preço com até 8 dígitos inteiros e 2 casas decimais.",
        )
        .refine((v) => Number(v) > 0, "O preço precisa ser maior que zero."),
    ),
  categoryId: z.uuid("Escolha uma categoria."),
  imageUrl: z
    .union([
      z.literal(""),
      z
        .url("Informe uma URL válida.")
        .refine((v) => /^https?:\/\//i.test(v), "Use uma URL http ou https."),
    ])
    .transform((v) => v || undefined),
});
export const checkoutSchema = z.object({
  customerName: name,
  customerPhone: z
    .string()
    .transform((v) => v.replace(/\D/g, ""))
    .pipe(
      z.string().regex(/^\d{11}$/, "Informe o celular com DDD e 11 dígitos."),
    ),
  paymentMethod: z.enum(["PIX", "CASH", "DEBIT_CARD", "CREDIT_CARD"]),
  items: z
    .array(
      z.object({
        productId: z.uuid(),
        quantity: z.number().int().min(1).max(2147483647),
      }),
    )
    .min(1, "Adicione pelo menos um produto."),
});
export const trackingSchema = z.uuid(
  "Informe um código de acompanhamento válido.",
);
