import fs from "fs";
import path from "path";

export const count = async (args) => {
  const inputIndex = args.indexOf("--input");

  if (inputIndex === -1 || !args[inputIndex + 1]) {
    throw new Error("Invalid arguments. Usage: --input <file.txt>");
  }

  const inputFile = path.resolve(args[inputIndex + 1]);

  if (!fs.existsSync(inputFile)) {
    throw new Error(`${inputFile} doesn't exist`);
  }

  let lines = 0;
  let words = 0;
  let characters = 0;
  let leftover = "";
  const stream = fs.createReadStream(inputFile, { encoding: "utf8" });

  stream.on("data", (chunk) => {
    characters += chunk.length;
    for (const char of chunk) {
      if (char === "\n") lines++;
    }

    const combinedChunk = leftover + chunk;
    const parts = combinedChunk.split(/\s+/);
    leftover = parts.pop();
    words += parts.filter(Boolean).length;
  });

  stream.on("end", () => {
    if (leftover.trim()) {
      words++;
      lines++;
    }
    console.log(`Lines: ${lines}`);
    console.log(`Words: ${words}`);
    console.log(`Characters: ${characters}`);
  });

  stream.on("error", () => {
    console.log("Count operation failed");
  });
};
