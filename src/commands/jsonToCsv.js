import fs from "fs";
import path from "path";
import { Transform, pipeline } from "stream";

export const convertJSON = async (args) => {
  const inputIndex = args.indexOf("--input");
  const outputIndex = args.indexOf("--output");

  if (
    inputIndex === -1 ||
    outputIndex === -1 ||
    !args[inputIndex + 1] ||
    !args[outputIndex + 1]
  ) {
    throw new Error(
      "Invalid arguments. Usage: --input <file.json> --output <file.csv>",
    );
  }

  const inputFile = path.resolve(args[inputIndex + 1]);
  const outputFile = path.resolve(args[outputIndex + 1]);

  if (!fs.existsSync(inputFile)) {
    throw new Error(`${inputFile} doesn't exist`);
  }

  const readStream = fs.createReadStream(inputFile);
  const writeStream = fs.createWriteStream(outputFile);

  let buffer = "";
  let headers = [];

  const jsonToCsv = new Transform({
    transform(chunk, _enc, callback) {
      buffer += chunk.toString();
      callback();
    },

    flush(callback) {
      try {
        const data = JSON.parse(buffer);

        if (!Array.isArray(data)) {
          throw new Error("JSON must be an array of objects");
        }

        for (const obj of data) {
          if (headers.length === 0) {
            headers = Object.keys(obj);
            this.push(headers.join(",") + "\n");
          }

          const values = Object.values(obj);
          this.push(values.join(",") + "\n");
        }

        callback();
      } catch (err) {
        callback(err);
      }
    },
  });

  pipeline(readStream, jsonToCsv, writeStream, (err) => {
    if (err) {
      console.error("json-to-csv cannot be done");
      return;
    }

    console.log("json-to-csv is done, result saved in:", outputFile);
  });
};
