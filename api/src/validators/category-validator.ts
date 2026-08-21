import { z } from "zod";

const createCategorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, "The name field must contain at least 3 characters")
    .max(50, "The name field must contain no more than 50 characters"),
});

type CreateCategoryInput = z.infer<typeof createCategorySchema>;

export { createCategorySchema, type CreateCategoryInput };
