import fs from "fs";
import path from "path";
import crypto from "crypto";
import { parseHashArgs } from "../utils/parseHashArgs.js";

export const hash = (args) => {
  const { inputPath, algorithm, save } = parseHashArgs(args);
  const supported = ["sha256", "md5", "sha512"];
  if (!supported.includes(algorithm)) {
    console.log(algorithm, "hash cannot be used");
    return;
  }

  const inputFile = path.resolve(inputPath);

  if (!fs.existsSync(inputFile)) {
    throw new Error(`${inputFile} doesn't exist`);
  }

  const hash = crypto.createHash(algorithm);
  const stream = fs.createReadStream(inputFile);

  stream.on("data", (chunk) => hash.update(chunk));
  stream.on("end", async () => {
    const digest = hash.digest("hex");
    console.log(`${algorithm}: ${digest}`);

    if (save) {
      const outputFile = `${inputFile}.${algorithm}`;
      fs.writeFile(outputFile, digest, "utf8", (err) => {
        if (err) throw err;
        console.log("Hash file has been saved:", outputFile);
      });
    }
  });

  stream.on("error", () => {
    console.log("Hash operation failed");
  });
};
