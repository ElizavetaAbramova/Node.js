import fs from "fs";
import path from "path";
import crypto from "crypto";
import { parseEncryptArgs } from "../utils/parseEncryptArgs.js";
import {
  SALT_LENGTH,
  IV_LENGTH,
  KEY_LENGTH,
  AUTH_TAG_LENGTH,
} from "./encrypt.js";

export function decrypt(args) {
  const { inputPath, outputPath, password } = parseEncryptArgs(args);

  const inputFile = path.resolve(inputPath);
  const outputFile = path.resolve(outputPath);

  if (!fs.existsSync(inputFile)) {
    throw new Error(`${inputFile} doesn't exist`);
  }

  const stat = fs.statSync(inputFile);
  const minimumSize = SALT_LENGTH + IV_LENGTH + AUTH_TAG_LENGTH;
  if (stat.size < minimumSize) {
    console.log(
      "Operation failed: file is too small to contain valid encryption headers",
    );
    return;
  }

  const fd = fs.openSync(inputFile, "r");

  const salt = Buffer.alloc(SALT_LENGTH);
  const iv = Buffer.alloc(IV_LENGTH);
  const authTag = Buffer.alloc(AUTH_TAG_LENGTH);

  fs.readSync(fd, salt, 0, SALT_LENGTH, 0);
  fs.readSync(fd, iv, 0, IV_LENGTH, SALT_LENGTH);
  fs.readSync(fd, authTag, 0, AUTH_TAG_LENGTH, stat.size - AUTH_TAG_LENGTH);

  const key = crypto.scryptSync(password, salt, KEY_LENGTH);
  const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(authTag);

  const inputStream = fs.createReadStream(inputFile, {
    start: SALT_LENGTH + IV_LENGTH,
    end: stat.size - AUTH_TAG_LENGTH - 1,
  });
  const outputStream = fs.createWriteStream(outputFile);

  inputStream.pipe(decipher).pipe(outputStream);

  inputStream.on("error", () => console.log("Operation failed"));
  outputStream.on("error", () => console.log("Operation failed"));
  decipher.on("error", () =>
    console.log("Operation failed: wrong password or corrupted file"),
  );

  outputStream.on("finish", () => {
    fs.closeSync(fd);
    console.log("Decryption complete. Decrypted file saved to:", outputFile);
  });
}
