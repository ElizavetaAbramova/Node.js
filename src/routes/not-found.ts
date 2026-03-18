import { type FastifyInstance } from "fastify";

export function registerNotFoundHandler(app: FastifyInstance) {
  app.setNotFoundHandler((request, reply) => {
    reply.status(404).send({
      statusCode: 404,
      message: `Route ${request.method}:${request.url} not found`,
      error: "Not Found",
    });
  });
}
