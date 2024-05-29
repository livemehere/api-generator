import fs, { writeFileSync } from "fs";
import { ServiceGenerator } from "./generators/ServiceGenerator";
import { globSync } from "glob";
import prettier from "prettier";
import { ApiConfig } from "./type";
import { resolve } from "path";
import { createDir, writeFile } from "./utils";

/* FIX */
const HTTP_CLIENT_FILE_NAME = "HttpClient.ts";
const HTTP_CLIENT_CODE = fs.readFileSync(
  resolve(__dirname, HTTP_CLIENT_FILE_NAME),
  "utf-8",
);

const configPath = resolve(process.cwd(), "api.config.ts");
const config: ApiConfig = require(configPath).default;

const rootPath = resolve(process.cwd(), config.path);
const queriesPath = resolve(rootPath, "queries");

/* INIT on RUNTIME */
createDir(rootPath, true);
createDir(queriesPath);
writeFile(resolve(rootPath, HTTP_CLIENT_FILE_NAME), HTTP_CLIENT_CODE);
buildServices();

// build().catch((e) => console.log(e));

/** Functions */
async function build() {
  const ignoreTargets = globSync(
    (config.ignorePattern || []).map((pattern) => `${config.path}/${pattern}`),
    {
      ignore: "node_modules/**",
    },
  );

  const ignorePaths = ignoreTargets.map((path) => resolve(process.cwd(), path));

  // load prettier options
  let prettierOptions = await prettier.resolveConfig(process.cwd());
  if (!prettierOptions) {
    prettierOptions = {};
  }
  prettierOptions.parser = "typescript";

  for (const [key, options] of Object.entries(config.services)) {
    const service = new ServiceGenerator(key, options);
    const serviceFilePath = resolve(rootPath, service.filename);
    const serviceQueryRootPath = resolve(queriesPath, service.className);
    createDir(serviceQueryRootPath);

    // build service file only in ignoreTargets
    service.buildService(serviceFilePath, ignorePaths, prettierOptions);
    service.buildQueryHooks(serviceQueryRootPath, ignorePaths, prettierOptions);
  }
}

function buildServices() {
  for (const [key, options] of Object.entries(config.services)) {
    const service = new ServiceGenerator(key, options);

    // Service File
    const serviceFilePath = resolve(rootPath, service.filename);
    writeFileSync(serviceFilePath, service.getCode());

    // hook directory
    const serviceQueryRootPath = resolve(queriesPath, service.className);
    createDir(serviceQueryRootPath);

    // Tanstack Query Hook Files
  }
}
