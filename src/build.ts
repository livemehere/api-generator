import fs, { writeFileSync } from "fs";
import { ServiceGenerator } from "./generators/ServiceGenerator";
import prettier from "prettier";
import { resolve } from "path";
import { createDir, loadTsFile, writeFile } from "./utils";
import { ApiConfig } from "./typings";

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

build().catch((e) => console.log(e));

async function build() {
  // load prettier options
  let prettierOptions = await prettier.resolveConfig(process.cwd());
  if (!prettierOptions) {
    prettierOptions = {};
  }
  prettierOptions.parser = "typescript";

  createDir(rootPath);
  createDir(queriesPath);
  writeFile(resolve(rootPath, HTTP_CLIENT_FILE_NAME), HTTP_CLIENT_CODE);

  /* Build APIs */
  for (const [key, options] of Object.entries(config.services)) {
    const service = new ServiceGenerator(key, options);

    // Service File
    const serviceFilePath = resolve(rootPath, service.filename);
    const serviceCode = await prettier.format(
      service.getCode(),
      prettierOptions,
    );
    writeFileSync(serviceFilePath, serviceCode);

    // hook directory
    const serviceQueryRootPath = resolve(queriesPath, service.className);
    createDir(serviceQueryRootPath);

    // Tanstack Query Hook Files
    for (const query of service.tanstackQueries) {
      const filePath = resolve(serviceQueryRootPath, `${query.filename}.ts`);
      const code = await prettier.format(query.getCode(), prettierOptions);
      writeFileSync(filePath, code);
    }
  }
}
