export function parseEncryptArgs(args) {
  const inputIndex = args.indexOf("--input");
  const outputIndex = args.indexOf("--output");
  const passwordIndex = args.indexOf("--password");

  if (
    inputIndex === -1 ||
    !args[inputIndex + 1] ||
    outputIndex === -1 ||
    !args[outputIndex + 1] ||
    passwordIndex === -1 ||
    !args[passwordIndex + 1]
  ) {
    console.log(
      "invalid arguments. Try this format: encrypt --input file.txt --output file.txt.enc --password mySecret",
    );
  }

  const inputPath = args[inputIndex + 1];
  const outputPath = args[outputIndex + 1];
  const password = args[passwordIndex + 1];

  return { inputPath, outputPath, password };
}
