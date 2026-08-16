import { z } from "zod";

const signUpSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(3, "The name field must contain at least 3 characters"),
    email: z.string().trim().email("The email field must be valid."),
    password: z
      .string()
      .min(6, "The password field must contain at least 6 characters."),
    confirmPassword: z
      .string()
      .min(6, "The confirm password field must contain at least 6 characters."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "The passwords must be the same.",
    path: ["confirmPassword"],
  });

const signInSchema = z.object({
  email: z.string().trim().email("The email field must be valid."),
  password: z
    .string()
    .min(6, "The password field must contain at least 6 characters."),
});

type SignUpInput = z.infer<typeof signUpSchema>;
type SignInInput = z.infer<typeof signInSchema>;

export { signUpSchema, type SignUpInput, signInSchema, type SignInInput };
