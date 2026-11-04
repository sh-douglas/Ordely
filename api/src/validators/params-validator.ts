import { z } from "zod";

const orderIdMessage = "Order ID must be an integer between 1 and 2147483647.";

// PostgreSQL SERIAL uses a signed 32-bit integer.
export const orderIdSchema = z
  .string()
  .regex(/^[0-9]+$/, orderIdMessage)
  .transform(Number)
  .pipe(
    z.number()
      .int(orderIdMessage)
      .min(1, orderIdMessage)
      .max(2147483647, orderIdMessage),
  );

export const productIdSchema = z.uuid("Product ID must be a valid UUID.");
export const trackingCodeSchema = z.uuid("Tracking code must be a valid UUID.");
