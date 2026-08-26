import type { PaymentMethod } from "../generated/prisma/enums.js";
import type { Prisma } from "../generated/prisma/client.js";
import { prisma } from "../lib/prisma.js";

interface OrderItemData {
  productId: string;
  quantity: number;
  unitPrice: Prisma.Decimal;
}

interface OrderCreateData {
  customerName: string;
  paymentMethod: PaymentMethod;
  items: OrderItemData[];
  total: Prisma.Decimal;
}

class OrderRepository {
  async create(data: OrderCreateData) {
    return prisma.order.create({
      data: {
        customerName: data.customerName,
        paymentMethod: data.paymentMethod,
        total: data.total,
        orderItems: {
          create: data.items,
        },
      },
    });
  }
}

export default new OrderRepository();
