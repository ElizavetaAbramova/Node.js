import { describe, it, expect, beforeAll, afterAll } from "vitest";
import supertest from "supertest";
import Fastify from "fastify";
import { productsRoutes } from "../routes/products.js";
import { writeFile } from "fs/promises";
import { join } from "path";

let app: ReturnType<typeof Fastify>;

const PRODUCTS_FILE_PATH_TEST = join(process.cwd(), "data/products.test.json");

describe("CRUD scenario", () => {
  beforeAll(async () => {
    app = Fastify();
    productsRoutes(app, {
      workDir: PRODUCTS_FILE_PATH_TEST,
    });
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it("GET /api/products should return array", async () => {
    const res = await supertest(app.server).get("/api/products");

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it("POST /api/products should create product", async () => {
    const res = await supertest(app.server).post("/api/products").send({
      name: "Test Product",
      description: "Test Description",
      price: 100,
      category: "test",
      inStock: true,
    });

    expect(res.status).toBe(201);
    expect(res.body.id).toBeDefined();
  });

  it("GET /api/products/:id should return created product", async () => {
    const createRes = await supertest(app.server).post("/api/products").send({
      name: "Test",
      description: "Test",
      price: 100,
      category: "test",
      inStock: true,
    });

    const id = createRes.body.id;

    const res = await supertest(app.server).get(`/api/products/${id}`);

    expect(res.status).toBe(200);
    expect(res.body.id).toBe(id);
  });

  it("DELETE /api/products/:id should delete product", async () => {
    const createRes = await supertest(app.server).post("/api/products").send({
      name: "Test",
      description: "Test",
      price: 100,
      category: "test",
      inStock: true,
    });

    const id = createRes.body.id;

    const deleteRes = await supertest(app.server).delete(`/api/products/${id}`);

    expect(deleteRes.status).toBe(204);
  });

  it("GET /api/products/:id should return 404 after deletion", async () => {
    const createRes = await supertest(app.server).post("/api/products").send({
      name: "Test",
      description: "Test",
      price: 100,
      category: "test",
      inStock: true,
    });

    const id = createRes.body.id;

    await supertest(app.server).delete(`/api/products/${id}`);

    const res = await supertest(app.server).get(`/api/products/${id}`);

    expect(res.status).toBe(404);
  });
});
