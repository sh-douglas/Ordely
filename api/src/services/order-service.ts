import AppError from "../errors/app-error.js";
import { OrderStatus, Prisma } from "../generated/prisma/client.js";
import orderRepository from "../repositories/order-repository.js";
import productRepository from "../repositories/product-repository.js";
import {
  createOrderSchema,
  updateOrderStatusSchema,
  type CreateOrderInput,
  type UpdateOrderStatusInput,
} from "../validators/order-validator.js";

class OrderService {
  async create(data: CreateOrderInput) {
    const parsedData = createOrderSchema.parse(data);
    const productIds = parsedData.items.map((product) => {
      return product.productId;
    });

    const products = await productRepository.findByIds(productIds);

    if (productIds.length !== products.length) {
      throw new AppError("One or more products were not found.", 404);
    }

    const hasUnavailableProduct = products.some((product) => {
      return !product.available;
    });

    if (hasUnavailableProduct) {
      throw new AppError("One or more products are unavailable.", 409);
    }

    const orderItems = parsedData.items.map((item) => {
      const foundProduct = products.find((product) => {
        return product.id === item.productId;
      });

      if (!foundProduct) {
        throw new AppError("Product not found.", 404);
      }

      return {
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: foundProduct.price,
      };
    });

    const total = orderItems.reduce((acc, item) => {
      const subtotal = item.unitPrice.mul(item.quantity);

      return acc.add(subtotal);
    }, new Prisma.Decimal(0));

    const order = {
      customerName: parsedData.customerName,
      customerPhone: parsedData.customerPhone,
      paymentMethod: parsedData.paymentMethod,
      items: orderItems,
      total,
    };

    const newOrder = await orderRepository.create(order);

    return newOrder;
  }

  async findActive() {
    const orders = await orderRepository.findActive();

    return orders;
  }

  async findById(id: number) {
    const order = await orderRepository.findById(id);

    return order;
  }

  async updateOrderStatus(id: number, data: UpdateOrderStatusInput) {
    const parsedData = updateOrderStatusSchema.parse(data);

    const order = await orderRepository.findById(id);

    if (!order) {
      throw new AppError("Order not found", 404);
    }

    const allowedStatus: Record<OrderStatus, OrderStatus[]> = {
      [OrderStatus.PENDING]: [OrderStatus.IN_PROGRESS, OrderStatus.CANCELED],
      [OrderStatus.IN_PROGRESS]: [OrderStatus.READY, OrderStatus.CANCELED],
      [OrderStatus.READY]: [OrderStatus.COMPLETED],
      [OrderStatus.COMPLETED]: [],
      [OrderStatus.CANCELED]: [],
    };

    if (!allowedStatus[order.status].includes(parsedData.status)) {
      throw new AppError("Invalid order status transition.", 409);
    }

    const updatedOrder = await orderRepository.updateStatus(
      id,
      parsedData.status,
    );

    return updatedOrder;
  }

  async findByTrackingCode(trackingCode: string) {
    const order = await orderRepository.findByTrackingCode(trackingCode);

    if (!order) {
      throw new AppError("Order not found.", 404);
    }

    const publicOrderData = {
      id: order.id,
      customerName: order.customerName,
      status: order.status,
      paymentMethod: order.paymentMethod,
      total: order.total,
      createdAt: order.createdAt,
      orderItems: order.orderItems.map((item) => {
        return {
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          product: {
            name: item.product.name,
            price: item.product.price,
          },
        };
      }),
    };

    return publicOrderData;
  }

  async findHistory() {
    const orders = await orderRepository.findHistory();

    return orders;
  }
}

export default new OrderService();
