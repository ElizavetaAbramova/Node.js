import path from "path";
import { scanDirectory } from "./utils/scanDirectory.js";

export const up = () => {
  const current = process.cwd();
  const parent = path.dirname(current);

  if (current === parent) {
    console.log(
      `Directory can't be changed. You are currently in ${process.cwd()}`,
    );
    return;
  }
  process.chdir(parent);

  console.log(`You are currently in ${process.cwd()}`);
};

export const cd = (pathArray) => {
  if (pathArray.length === 0) {
    throw new Error("no path provided");
  }

  const normalizedPath = path.normalize(pathArray.join(" "));
  process.chdir(normalizedPath);
  console.log(`You are currently in ${process.cwd()}`);
};

export const ls = async () => {
  const dirContent = await scanDirectory(process.cwd());

  const folderArray = dirContent
    .filter((item) => item.type === "folder")
    .sort((a, b) => a.path - b.path);
  const filesArray = dirContent
    .filter((item) => item.type === "file")
    .sort((a, b) => a.path - b.path);

  const formattedContentList = folderArray.concat(filesArray);
  for (const item of formattedContentList) {
    console.log(`${item.path.padEnd(15)} [${item.type}]`);
  }
};
