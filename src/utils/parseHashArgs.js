export function parseHashArgs(args) {
  const inputIndex = args.indexOf("--input");
  if (inputIndex === -1 || !args[inputIndex + 1]) {
    console.log("invalid arguments. Try this format: hash --input <file.txt>");
  }

  const inputPath = args[inputIndex + 1];

  const algorithmIndex = args.indexOf("--algorithm");
  const algorithm =
    algorithmIndex !== -1 && args[algorithmIndex + 1]
      ? args[algorithmIndex + 1].toLowerCase()
      : "sha256";

  const save = args.includes("--save");

  return { inputPath, algorithm, save };
}
