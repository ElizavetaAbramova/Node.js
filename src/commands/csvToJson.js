import fs from "fs";
import path from "path";
import { Transform, pipeline } from "stream";

export const convertCsv = async (args) => {
  const inputIndex = args.indexOf("--input");
  const outputIndex = args.indexOf("--output");

  if (
    inputIndex === -1 ||
    outputIndex === -1 ||
    !args[inputIndex + 1] ||
    !args[outputIndex + 1]
  ) {
    throw new Error(
      "Invalid arguments. Usage: --input <file.csv> --output <file.json>",
    );
  }

  const inputFile = path.resolve(args[inputIndex + 1]);
  const outputFile = path.resolve(args[outputIndex + 1]);

  if (!fs.existsSync(inputFile)) {
    throw new Error(`${inputFile} doesn't exist`);
  }

  const readStream = fs.createReadStream(inputFile);
  const writeStream = fs.createWriteStream(outputFile);

  let headers = null;
  let leftover = "";

  const lineSplitter = new Transform({
    readableObjectMode: true,

    transform(chunk, _encoding, callback) {
      const data = leftover + chunk.toString();
      const lines = data.split("\n");

      leftover = lines.pop();

      for (const line of lines) {
        this.push(line.trim());
      }

      callback();
    },

    flush(callback) {
      if (leftover) {
        this.push(leftover.trim());
      }
      callback();
    },
  });

  const csvParser = new Transform({
    readableObjectMode: true,
    writableObjectMode: true,

    transform(line, _encoding, callback) {
      if (!line) return callback();

      const values = line.split(",");

      if (!headers) {
        headers = values;
        return callback();
      }

      const obj = {};

      headers.forEach((h, i) => {
        obj[h] = values[i];
      });

      callback(null, obj);
    },
  });

  let first = true;

  const writeJsonStr = new Transform({
    writableObjectMode: true,

    transform(obj, _encoding, callback) {
      let str = "";

      if (!first) {
        str += ",\n";
      }

      str += JSON.stringify(obj);
      first = false;

      callback(null, str);
    },
  });

  writeStream.write("[\n");

  pipeline(
    readStream,
    lineSplitter,
    csvParser,
    writeJsonStr,
    writeStream,
    (err) => {
      if (err) {
        console.error("csv-to-json cannot be done");
        return;
      } else {
        fs.appendFileSync(outputFile, "\n]");
        console.log("csv-to-json is done, result saved in:", outputFile);
      }
    },
  );
};
