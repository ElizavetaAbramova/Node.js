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

const getAllProducts = async (filePath: string): Promise<Product[]> => {
  const file = await readFile(filePath, "utf-8");
  const products: Product[] = JSON.parse(file);

  return products;
};

const getProductById = async (
  request: FastifyRequest,
  reply: FastifyReply,
  workDir: string,
) => {
  try {
    const { productId } = request.params as { productId: string };

    if (!isUuid(productId)) {
      reply.status(400).send({ message: "Invalid productId" });
      return null;
    }

    const products = await getAllProducts(workDir);
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

const saveProducts = async (products: Product[], filePath: string) => {
  await writeFile(filePath, JSON.stringify(products, null, 2));
};

const addProduct = async (
  request: FastifyRequest,
  reply: FastifyReply,
  workDir: string,
) => {
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

    const products = await getAllProducts(workDir);
    products.push(newProduct);
    await saveProducts(products, workDir);

    return reply.status(201).send(newProduct);
  } catch (err) {
    return reply.status(500).send({ message: "Internal server error" });
  }
};

const deleteProduct = async (
  request: FastifyRequest,
  reply: FastifyReply,
  workDir: string,
) => {
  const { productId } = request.params as { productId: string };

  if (!isUuid(productId)) {
    return reply.status(400).send({
      message: "Invalid productId",
    });
  }

  const products = await getAllProducts(workDir);

  const index = products.findIndex((p) => p.id === productId);

  if (index === -1) {
    return reply.status(404).send({
      message: "Product not found",
    });
  }

  products.splice(index, 1);
  await saveProducts(products, workDir);

  return reply.status(204).send();
};

const updateProduct = async (
  request: FastifyRequest,
  reply: FastifyReply,
  workDir: string,
) => {
  const { productId } = request.params as { productId: string };

  if (!isUuid(productId)) {
    return reply.status(400).send({
      message: "Invalid productId",
    });
  }

  const parsed = createProductSchema.safeParse(request.body);

  if (!parsed.success) {
    return reply.status(400).send({
      message: parsed.error.issues[0]?.message,
    });
  }

  const products = await getAllProducts(workDir);

  const index = products.findIndex((p) => p.id === productId);

  if (index === -1) {
    return reply.status(404).send({
      message: "Product not found",
    });
  }

  const updatedProduct = {
    id: productId,
    ...parsed.data,
  };

  products[index] = updatedProduct;

  await saveProducts(products, workDir);

  return reply.status(200).send(updatedProduct);
};

export async function productsRoutes(
  app: FastifyInstance,
  workDir: string = PRODUCTS_FILE_PATH,
) {
  app.get("/api/products", () => getAllProducts(workDir));
  app.get("/api/products/:productId", (request, reply) =>
    getProductById(request, reply, workDir),
  );
  app.post("/api/products", (request, reply) =>
    addProduct(request, reply, workDir),
  );
  app.delete("/api/products/:productId", (request, reply) =>
    deleteProduct(request, reply, workDir),
  );
  app.put("/api/products/:productId", (request, reply) =>
    updateProduct(request, reply, workDir),
  );
}
