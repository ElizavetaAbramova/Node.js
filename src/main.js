import { createInterface } from "readline";
import os from "os";
import { cd, ls, up } from "./navigation.js";
import { convertCsv } from "./commands/csvToJson.js";
import { convertJSON } from "./commands/jsonToCsv.js";

const onCloseHandler = () => {
  console.log("Thank you for using Data Processing CLI!");
  process.exit(0);
};

const main = async () => {
  const homeDir = os.homedir();
  process.chdir(os.homedir());

  const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: "> ",
  });

  console.log("Welcome to Data Processing CLI!");
  console.log(`You are currently in ${process.cwd()}`);

  rl.prompt();

  rl.on("line", async (line) => {
    const [command, ...args] = line.trim().split(" ");

    try {
      switch (command) {
        case "up":
          up();
          break;

        case "cd":
          cd(args);
          break;

        case "ls":
          await ls();
          break;

        case "csv-to-json":
          await convertCsv(args);
          break;

        case "json-to-csv":
          await convertJSON(args);
          break;

        case ".exit":
          onCloseHandler();
          break;

        default:
          console.log("Invalid input. Unknown command or invalid argument");
      }
    } catch (error) {
      console.error("Operation failed:", error.message);
    }

    rl.prompt();
  });

  rl.on("close", onCloseHandler);
  rl.on("SIGINT", onCloseHandler);
};

await main();
