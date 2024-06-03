const typescript = require("typescript");
const { resolve } = require("path");
const fs = require("fs");

const path = resolve(__dirname, "../api.config.ts");
const source = fs.readFileSync(path, "utf-8");
const res = typescript.transpileModule(source, {
  compilerOptions: {
    module: typescript.ModuleKind.CommonJS,
  },
});

const configObj = eval(res.outputText);
console.log(configObj);
