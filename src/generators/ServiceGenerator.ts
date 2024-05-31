import fs from "fs";
import jsonToTs from "json-to-ts";
import prettier from "prettier";
import { ApiSpec, ApiType, ServiceOption } from "../type";
import { resolve } from "path";
import { parseBracket, toCamelCase, toPascalCase } from "../utils";
import { HttpClientGenerator } from "./HttpClientGenerator";
import { RequestGenerator } from "./RequestGenerator";
import { Generator } from "./Generator";
import { TanstackQueryGenerator } from "./TanstackQueryGenerator";

export class ServiceGenerator implements Generator {
  name;
  filename;
  options;
  className;
  instanceName;

  httpClientStr;
  requestStr = "";
  typeStr = "";

  tanstackQueries: TanstackQueryGenerator[] = [];

  private requestCache: { [key: string]: RequestGenerator } = {};

  constructor(name: string, options: ServiceOption) {
    this.options = options;
    this.name = name;
    this.className = `${toPascalCase(name)}Service`;
    this.filename = `${this.className}.ts`;
    this.instanceName = toCamelCase(this.className);
    this.httpClientStr = new HttpClientGenerator(options).getCode();

    this.options.apis?.forEach((api) => {
      const rg = new RequestGenerator(api, this.className, this.instanceName);
      this.requestCache[api.name] = rg;
      this.typeStr += rg.types.fullStr + "\n";
      this.requestStr += rg.getCode() + "\n";

      const isQuery = api.useQuery || api.useInfiniteQuery || api.useMutation;
      if (isQuery) {
        const queryHook = new TanstackQueryGenerator(rg);
        this.tanstackQueries.push(queryHook);
      }
    });
  }

  getCode() {
    return `
            import HttpClient from './HttpClient';
            ${this.options.defaultScript || ""}
            
            ${this.typeStr}
            
            class ${this.className} {
                ${this.httpClientStr}
                ${this.requestStr}
            }
            export const ${this.instanceName} = new ${this.className}();
        `;
  }
}
