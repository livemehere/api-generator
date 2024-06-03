import fs from "fs";
import { ServiceGenerator } from "./generators/ServiceGenerator";
import prettier from "prettier";
import { resolve } from "path";
import {
  createDir,
  getFileStringOrNull,
  getLogTitle,
  isDiff,
  isIgnoreFile,
  loadTsFile,
  writeFile,
} from "./utils";
import { ApiConfig } from "./typings";
import { glob } from "glob";

let changedCnt = 0;

/* FIX */
const HTTP_CLIENT_FILE_NAME = "HttpClient.ts";
const HTTP_CLIENT_CODE = fs.readFileSync(
  resolve(__dirname, HTTP_CLIENT_FILE_NAME),
  "utf-8",
);

const configPath = resolve(process.cwd(), "api.config.ts");
const config: ApiConfig = loadTsFile(configPath);

const rootPath = resolve(process.cwd(), config.path);
const queriesPath = resolve(rootPath, "queries");

build()
  .catch((e) => console.log(e))
  .finally(() => {
    console.log(`API Build Finished. Changed ${changedCnt} files.`);
  });

async function build() {
  // load prettier options
  let prettierOptions = await prettier.resolveConfig(process.cwd());
  if (!prettierOptions) {
    prettierOptions = {};
  }
  prettierOptions.parser = "typescript";

  const ignoreFiles = await glob(config.ignorePattern || [], {
    ignore: "node_modules/**",
  });

  createDir(rootPath);
  createDir(queriesPath);

  const httpClientPath = resolve(rootPath, HTTP_CLIENT_FILE_NAME);

  if (!isIgnoreFile(ignoreFiles, httpClientPath)) {
    const prevCode = getFileStringOrNull(httpClientPath);
    const diff = isDiff(prevCode, HTTP_CLIENT_CODE);
    const title = getLogTitle(!!prevCode, diff);
    if (!prevCode || diff) {
      writeFile(httpClientPath, HTTP_CLIENT_CODE);
      changedCnt++;
      console.log(`API ${title}: ${httpClientPath}`);
    }
  }

  /* Build APIs */
  for (const [key, options] of Object.entries(config.services)) {
    const service = new ServiceGenerator(key, options);

    // Service File
    const serviceFilePath = resolve(rootPath, service.filename);
    const serviceCode = await prettier.format(
      service.getCode(),
      prettierOptions,
    );

    if (!isIgnoreFile(ignoreFiles, serviceFilePath)) {
      const prevCode = getFileStringOrNull(serviceFilePath);
      const diff = isDiff(prevCode, serviceCode);
      const title = getLogTitle(!!prevCode, diff);
      if (!prevCode || diff) {
        writeFile(serviceFilePath, serviceCode);
        changedCnt++;
        console.log(`API ${title}: ${serviceFilePath}`);
      }
    }

    // hook directory
    const serviceQueryRootPath = resolve(queriesPath, service.className);
    createDir(serviceQueryRootPath);

    // Tanstack Query Hook Files
    for (const query of service.tanstackQueries) {
      const filePath = resolve(serviceQueryRootPath, `${query.filename}.ts`);
      const code = await prettier.format(query.getCode(), prettierOptions);
      if (!isIgnoreFile(ignoreFiles, filePath)) {
        const prevCode = getFileStringOrNull(filePath);
        const diff = isDiff(prevCode, code);
        const title = getLogTitle(!!prevCode, diff);
        if (!prevCode || diff) {
          writeFile(filePath, code);
          changedCnt++;
          console.log(`API ${title}: ${filePath}`);
        }
      }
    }
  }
}
