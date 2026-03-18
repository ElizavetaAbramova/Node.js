import { buildApp } from "./app.js";

const port = Number(process.env.PORT) || 4000;

const start = async () => {
  const app = buildApp();

  console.log("Server started at localhost:", port);

  await app.listen({ port });
};

start();
