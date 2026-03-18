import Fastify from "fastify";
import { productsRoutes } from "./routes/products.js";
import { registerNotFoundHandler } from "./routes/not-found.js";

export function buildApp() {
  const app = Fastify();

  app.get("/", async (request, reply) => {
    return { message: "Server is working, select route" };
  });

  app.register(productsRoutes);
  registerNotFoundHandler(app);
  app.setErrorHandler((_err, _req, reply) => {
    reply.status(500).send({ message: "Internal server error" });
  });

  return app;
}
