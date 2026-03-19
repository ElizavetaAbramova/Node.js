import {
  type FastifyInstance,
  type FastifyReply,
  type FastifyRequest,
} from "fastify";
import type { Product } from "../types.js";
import { readFile, writeFile } from "fs/promises";
import { join } from "path";
import { validate as isUuid } from "uuid";
import { createProductSchema } from "../utils/productValidator.js";
import { randomUUID } from "crypto";

const PRODUCTS_FILE_PATH = join(process.cwd(), "data/products.json");

const getAllProducts = async (): Promise<Product[]> => {
  const file = await readFile(PRODUCTS_FILE_PATH, "utf-8");
  const products: Product[] = JSON.parse(file);

  return products;
};

const getProductById = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const { productId } = request.params as { productId: string };

    if (!isUuid(productId)) {
      reply.status(400).send({ message: "Invalid productId" });
      return null;
    }

    const products = await getAllProducts();
    const product = products.find((p) => p.id === productId);

    if (!product) {
      reply.status(404).send({ message: `Product ${productId} not found` });
      return null;
    }

    reply.status(200).send(product);
    return product;
  } catch (error) {
    return reply.status(500).send({ message: "Internal server error" });
  }
};

const saveProducts = async (products: Product[]) => {
  await writeFile(PRODUCTS_FILE_PATH, JSON.stringify(products, null, 2));
};

const postProduct = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const parsed = createProductSchema.safeParse(request.body);

    if (!parsed.success) {
      return reply.status(400).send({
        message: parsed.error.issues[0]?.message,
      });
    }

    const newProduct: Product = {
      id: randomUUID(),
      ...parsed.data,
    };

    const products = await getAllProducts();
    products.push(newProduct);
    await saveProducts(products);

    return reply.status(201).send(newProduct);
  } catch (err) {
    return reply.status(500).send({ message: "Internal server error" });
  }
};

const deleteProduct = async (request: FastifyRequest, reply: FastifyReply) => {
  const { productId } = request.params as { productId: string };

  if (!isUuid(productId)) {
    return reply.status(400).send({
      message: "Invalid productId",
    });
  }

  const products = await getAllProducts();

  const index = products.findIndex((p) => p.id === productId);

  if (index === -1) {
    return reply.status(404).send({
      message: "Product not found",
    });
  }

  products.splice(index, 1);
  await saveProducts(products);

  return reply.status(204).send();
};

export async function productsRoutes(app: FastifyInstance) {
  app.get("/api/products", getAllProducts);
  app.get("/api/products/:productId", getProductById);
  app.post("/api/products", postProduct);
  app.delete("/api/products/:productId", deleteProduct);
}
