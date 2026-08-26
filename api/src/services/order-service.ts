import AppError from "../errors/app-error.js";
import { Prisma } from "../generated/prisma/client.js";
import OrderRepository from "../repositories/order-repository.js";
import ProductRepository from "../repositories/product-repository.js";
import {
  createOrderSchema,
  type CreateOrderInput,
} from "../validators/order-validator.js";

class OrderService {
  async create(data: CreateOrderInput) {
    const parsedData = createOrderSchema.parse(data);
    const productIds = parsedData.items.map((product) => {
      return product.productId;
    });

    const products = await ProductRepository.findByIds(productIds);

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
      paymentMethod: parsedData.paymentMethod,
      items: orderItems,
      total,
    };

    const newOrder = await OrderRepository.create(order);

    return newOrder;
  }
}

export default new OrderService();
