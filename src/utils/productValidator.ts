import { z } from "zod";

export const createProductSchema = z.object({
  name: z
    .string({ error: "Name is required" })
    .nonempty({ message: "Name cannot be empty" }),
  description: z
    .string({ error: "Description is required" })
    .nonempty({ message: "Description cannot be empty" }),
  price: z
    .number({ error: "Price is required" })
    .positive({ message: "Price must be positive" }),
  category: z
    .string({ error: "Category is required" })
    .nonempty({ message: "Category cannot be empty" }),
  inStock: z.boolean({ error: "InStock is required" }),
});
