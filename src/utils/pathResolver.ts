import { dirname, join, resolve } from "path";
import { fileURLToPath } from "url";

export const pathResolver = (relativePath: string) => {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);

  const filePath = resolve(__dirname, relativePath);
  return filePath;
};
