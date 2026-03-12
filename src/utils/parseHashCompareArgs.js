export function parseHashCompareArgs(args) {
  const inputIndex = args.indexOf("--input");
  const hashIndex = args.indexOf("--hash");

  if (
    inputIndex === -1 ||
    !args[inputIndex + 1] ||
    hashIndex === -1 ||
    !args[hashIndex + 1]
  ) {
    console.log(
      "invalid arguments. Try this format: hash-compare --input <file.txt> --hash <file.txt.sha256>",
    );
  }

  const inputPath = args[inputIndex + 1];
  const hashPath = args[hashIndex + 1];

  const algorithmIndex = args.indexOf("--algorithm");
  const algorithm =
    algorithmIndex !== -1 && args[algorithmIndex + 1]
      ? args[algorithmIndex + 1].toLowerCase()
      : "sha256";

  return { inputPath, hashPath, algorithm };
}
