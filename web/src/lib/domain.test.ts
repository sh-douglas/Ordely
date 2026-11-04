import { describe, expect, it } from "vitest";
import {
  cartTotal,
  checkoutSchema,
  employeeSchema,
  productSchema,
  trackingSchema,
  transitions,
  type CartLine,
} from "./domain";
const id = "a011a0d5-1ac1-4df0-a1d0-000000000002";
describe("contratos de entrada da API", () => {
  it("normaliza celular e envia apenas IDs e quantidades no pedido", () => {
    const order = checkoutSchema.parse({
      customerName: "  Maria  ",
      customerPhone: "(11) 99999-9999",
      paymentMethod: "PIX",
      items: [{ productId: id, quantity: 2, price: 10 }],
    });
    expect(order.customerName).toBe("Maria");
    expect(order.customerPhone).toBe("11999999999");
    expect(order.items).toEqual([{ productId: id, quantity: 2 }]);
  });
  it("rejeita sacola vazia, telefone curto e quantidade fracionada", () => {
    const data = {
      customerName: "Maria",
      customerPhone: "11999999999",
      paymentMethod: "CASH",
      items: [{ productId: id, quantity: 1 }],
    };
    for (const change of [
      { items: [] },
      { customerPhone: "123" },
      { items: [{ productId: id, quantity: 1.5 }] },
    ])
      expect(checkoutSchema.safeParse({ ...data, ...change }).success).toBe(
        false,
      );
  });
  it("normaliza preço com vírgula e omite campos opcionais vazios", () => {
    expect(
      productSchema.parse({
        name: "Produto",
        price: "12,50",
        categoryId: id,
        imageUrl: "",
        description: "",
      }),
    ).toEqual({
      name: "Produto",
      price: "12.50",
      categoryId: id,
      imageUrl: undefined,
      description: undefined,
    });
  });
  it("rejeita preço negativo, precisão excessiva e URL insegura", () => {
    const data = {
      name: "Produto",
      price: "12.50",
      categoryId: id,
      imageUrl: "",
      description: "",
    };
    for (const change of [
      { price: "-1" },
      { price: "1.234" },
      { price: "100000000" },
      { imageUrl: "javascript:alert(1)" },
    ])
      expect(productSchema.safeParse({ ...data, ...change }).success).toBe(
        false,
      );
  });
  it("rejeita senhas diferentes e código de acompanhamento inválido", () => {
    expect(
      employeeSchema.safeParse({
        name: "Maria",
        email: "maria@example.com",
        password: "secret1",
        confirmPassword: "secret2",
      }).success,
    ).toBe(false);
    expect(trackingSchema.safeParse("pedido-1").success).toBe(false);
  });
  it("calcula o total estimado em centavos", () => {
    expect(
      cartTotal([
        { product: { price: "0.10" }, quantity: 3 },
        { product: { price: "0.20" }, quantity: 1 },
      ] as CartLine[]),
    ).toBe(0.5);
  });
  it("reflete o fluxo permitido pelo serviço de pedidos", () => {
    expect(transitions).toEqual({
      PENDING: ["IN_PROGRESS", "CANCELED"],
      IN_PROGRESS: ["READY", "CANCELED"],
      READY: ["COMPLETED"],
      COMPLETED: [],
      CANCELED: [],
    });
  });
});
