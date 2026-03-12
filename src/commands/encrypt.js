import fs from "fs";
import path from "path";
import crypto from "crypto";
import { parseEncryptArgs } from "../utils/parseEncryptArgs.js";

export const SALT_LENGTH = 16;
export const IV_LENGTH = 12;
export const KEY_LENGTH = 32;
export const AUTH_TAG_LENGTH = 16;

export const encrypt = (args) => {
  const { inputPath, outputPath, password } = parseEncryptArgs(args);

  const inputFile = path.resolve(inputPath);
  const outputFile = path.resolve(outputPath);

  if (!fs.existsSync(inputFile)) {
    throw new Error(`${inputFile} doesn't exist`);
  }

  const salt = crypto.randomBytes(SALT_LENGTH);
  const iv = crypto.randomBytes(IV_LENGTH);
  const key = crypto.scryptSync(password, salt, KEY_LENGTH);

  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);

  const inputStream = fs.createReadStream(inputFile);
  const outputStream = fs.createWriteStream(outputFile);

  outputStream.write(Buffer.concat([salt, iv]));

  inputStream.pipe(cipher).pipe(outputStream);

  inputStream.on("error", () => console.log("Operation failed"));
  outputStream.on("error", () => console.log("Operation failed"));

  outputStream.on("finish", () => {
    const authTag = cipher.getAuthTag();
    fs.appendFileSync(outputFile, authTag);
    console.log("Encrypted file has been saved:", outputFile);
  });
};
