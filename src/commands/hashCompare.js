import fs from "fs";
import path from "path";
import crypto from "crypto";
import { parseHashCompareArgs } from "../utils/parseHashCompareArgs.js";

export const hashCompare = (args) => {
  const { inputPath, hashPath, algorithm } = parseHashCompareArgs(args);

  const inputFile = path.resolve(inputPath);
  const hashFile = path.resolve(hashPath);

  if (!fs.existsSync(inputFile) || !fs.existsSync(hashFile)) {
    throw new Error(`${inputFile} or ${hashFile} doesn't exist`);
  }
  const expectedHash = fs.readFileSync(hashFile, "utf8");
  const hash = crypto.createHash(algorithm);
  const stream = fs.createReadStream(inputFile);

  stream.on("data", (chunk) => hash.update(chunk));
  stream.on("end", async () => {
    const digest = hash.digest("hex");
    if (digest === expectedHash) {
      console.log("OK");
    } else {
      console.log("MISMATCH");
    }
  });

  stream.on("error", () => {
    console.log("Hash operation failed");
  });
};
