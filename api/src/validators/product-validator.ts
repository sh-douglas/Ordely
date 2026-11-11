import { z } from "zod";

const createProductSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, "The name field must contain at least 3 characters.")
    .max(100, "The name field must contain no more than 100 characters."),
  description: z
    .string()
    .trim()
    .max(150, "The description field must contain no more than 150 characters.")
    .optional(),
  price: z
    .string()
    .trim()
    .min(1, "Price cannot be empty.")
    .regex(/^(0|[1-9]\d{0,7})(\.\d{1,2})?$/, {
      message:
        "Price must be a positive decimal number with up to 8 integer digits and 2 decimal places.",
    })
    .refine((val) => parseFloat(val) > 0, {
      message: "Price must be greater than zero.",
    }),
  categoryId: z.string().uuid(),
  imageUrl: z.string().trim().url().optional(),
});

const updateProductSchema = createProductSchema
  .extend({
    description: createProductSchema.shape.description.nullable(),
    imageUrl: createProductSchema.shape.imageUrl.nullable(),
  })
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "Provide at least one product field to update.",
  });
export { updateProductSchema };
export type UpdateProductInput = z.infer<typeof updateProductSchema>;

const updateProductAvailableSchema = z.object({
  available: z.boolean(),
});

type CreateProductInput = z.infer<typeof createProductSchema>;
type UpdateProductAvailableInput = z.infer<typeof updateProductAvailableSchema>;

export {
  createProductSchema,
  type CreateProductInput,
  updateProductAvailableSchema,
  type UpdateProductAvailableInput,
};
