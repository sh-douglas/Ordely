import { z } from "zod";
import { PaymentMethod } from "../generated/prisma/enums.js";
import { OrderStatus } from "../generated/prisma/enums.js";

const orderItemSchema = z.object({
  productId: z.uuid(),
  quantity: z
    .number()
    .int()
    .min(1, "The number of items cannot be less than 1."),
});

const createOrderSchema = z.object({
  customerName: z
    .string()
    .trim()
    .min(3, "The name field must contain at least 3 characters."),
  paymentMethod: z.enum(PaymentMethod),
  items: z
    .array(orderItemSchema)
    .min(1, "Order must contain at least one item.")
    .refine(
      (items) => {
        const productIds = items.map((item) => item.productId);
        return productIds.length === new Set(productIds).size;
      },
      {
        message: "Order cannot contain duplicate products.",
        path: [],
      },
    ),
});

const updateOrderStatusSchema = z.object({
  status: z.enum(OrderStatus),
});

type CreateOrderInput = z.infer<typeof createOrderSchema>;
type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;

export {
  createOrderSchema,
  type CreateOrderInput,
  updateOrderStatusSchema,
  type UpdateOrderStatusInput,
};
