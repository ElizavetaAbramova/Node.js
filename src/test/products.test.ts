import { describe, it, expect, beforeAll } from "vitest";
import supertest from "supertest";
import Fastify from "fastify";
import { productsRoutes } from "../routes/products.js";
import type { Product } from "../types.js";

let app: ReturnType<typeof Fastify>;
let createdProductId: string;

beforeAll(() => {
  app = Fastify();
  productsRoutes(app);
});

describe("GET /api/products/:productId", () => {
  it("should return 400 for invalid UUID", async () => {
    const res = await supertest(app.server).get("/api/products/123");
    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Invalid productId");
  });

  it("should return 404 for non-existent product", async () => {
    const res = await supertest(app.server).get("/api/products/00000000");
    expect(res.status).toBe(404);
    expect(res.body.message).toBe("Product 00000000 not found");
  });

  it("should return 200 and the product if it exists", async () => {
    const allProductsRes = await supertest(app.server).get("/api/products");
    const product: Product = allProductsRes.body[0];
    createdProductId = product.id;

    const res = await supertest(app.server).get(
      `/api/products/${createdProductId}`,
    );
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(createdProductId);
  });
});
