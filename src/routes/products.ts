import { type FastifyInstance, type FastifyReply } from "fastify";
import type { Product } from "../types.js";
import { readFile } from "fs/promises";
import { join } from "path";
import { validate as isUuid } from "uuid";

const PRODUCTS_FILE_PATH = join(process.cwd(), "data/products.json");

const getAllProducts = async (): Promise<Product[]> => {
  const file = await readFile(PRODUCTS_FILE_PATH, "utf-8");
  const products: Product[] = JSON.parse(file);

  return products;
};

const getProductById = async (
  productId: string,
  reply: FastifyReply,
): Promise<Product | null> => {
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

  return product;
};

export async function productsRoutes(app: FastifyInstance) {
  app.get("/api/products", getAllProducts);
  app.get("/api/products/:productId", async (request, reply) => {
    const { productId } = request.params as { productId: string };
    const product = await getProductById(productId, reply);
    reply.status(200).send(product);
  });
}
