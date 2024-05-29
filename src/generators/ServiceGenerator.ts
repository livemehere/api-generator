import fs from "fs";
import jsonToTs from "json-to-ts";
import prettier from "prettier";
import { ApiSpec, ApiType, ServiceOption } from "../type";
import { resolve } from "path";
import { parseBracket, toCamelCase, toPascalCase } from "../utils";
import { HttpClientGenerator } from "./HttpClientGenerator";

export class ServiceGenerator {
  name;
  filename;
  options;
  className;
  httpClient;
  requests = "";
  types = "";
  typeCache: { [key: string]: ApiType } = {};
  constructor(name: string, options: ServiceOption) {
    this.options = options;
    this.name = name;
    this.className = `${name}Service`;
    this.filename = `${this.className}.ts`;
    this.httpClient = new HttpClientGenerator(options).getCode();

    if (this.options.apis) {
      this.types = this.options.apis
        .map((api) => this.#generateApiType(api).fullStr)
        .join("\n");
      this.requests = this.options.apis
        .map((api) => this.#generateRequest(api))
        .join("\n");
    }
  }

  getCode() {
    return `
            import HttpClient from './HttpClient';
            ${this.options.defaultTopScript || ""}
            ${this.types}
            class ${this.className} {
                ${this.httpClient}
                ${this.requests}
            }
            export const ${toCamelCase(this.className)} = new ${this.className}();
        `;
  }

  generateQueryFiles(): { name: string; content: string }[] {
    const queries: { name: string; content: string }[] = [];
    for (const api of this.options.apis) {
      if (!api.useQuery && !api.useInfiniteQuery && !api.useMutation) continue;
      const typeInfo = this.typeCache[api.name];
      const fileName = api.useMutation
        ? `useMutate${toPascalCase(api.name)}`
        : api.useQuery
          ? `use${toPascalCase(api.name)}`
          : `useInfinite${toPascalCase(api.name)}`;
      const instanceName = toCamelCase(this.className);
      const isStrictParams = !!api.useQueryStrictParams;
      const queryParamType = isStrictParams
        ? typeInfo.paramTypeName
        : `Partial<${typeInfo.paramTypeName}>`;

      const hasParam = !!typeInfo?.paramTypeName;
      const importFromService = [typeInfo?.paramTypeName, instanceName]
        .filter((v) => v)
        .join(",");

      let res: { name: string; content: string } = {
        name: fileName,
        content: "",
      };
      if (api.useQuery) {
        res = {
          name: fileName,
          content: `
                    import { useQuery } from '@tanstack/react-query';
                    import { ${importFromService} } from '../../${this.className}';
                    
                    const ${fileName} = (${hasParam ? `params: ${queryParamType}` : ""}) => {
                        return useQuery({
                            queryKey: ['${api.name}'${hasParam ? `,JSON.stringify(params)` : ""}],
                            queryFn: () => ${instanceName}.${api.name}(${hasParam ? `params as NonNullable<${typeInfo.paramTypeName}>` : ""}),
                            ${hasParam ? `enabled: Object.keys(params).every((key) => params[key as keyof ${typeInfo.paramTypeName}] != null )` : ""}
                        });
                    };
                    
                    export default ${fileName};
                    `,
        };
      } else if (api.useInfiniteQuery) {
        const {
          initialPageParam,
          pageKey,
          getNextPageParam,
          getPreviousPageParam,
          queryKey,
          defaultTopScript,
        } = api.useInfiniteQuery;
        const QUERY_KEY = queryKey ? queryKey : `['${api.name}']`;
        res = {
          name: fileName,
          content: `
                    import { useInfiniteQuery } from '@tanstack/react-query';
                    import { ${typeInfo.paramTypeName}, ${instanceName} } from '../../${this.className}';
                    
                    ${defaultTopScript || ""}
                    
                    const ${fileName} = (initialPageParam = ${initialPageParam}, params: Omit<${queryParamType}, '${pageKey}'>) => {
                        return useInfiniteQuery({
                            queryKey: ${QUERY_KEY},
                            queryFn: ({pageParam}) => ${instanceName}.${api.name}({...(params as NonNullable<${typeInfo.paramTypeName}>),${pageKey}:pageParam}),
                            initialPageParam: initialPageParam,
                            ${hasParam ? `enabled: Object.keys(params).every((key) => params[key as keyof Omit<${queryParamType}, '${pageKey}'>] != null ),` : ""}
                            ${getNextPageParam ? `getNextPageParam:${getNextPageParam}` : ""},
                            ${getPreviousPageParam ? `getPreviousPageParam:${getPreviousPageParam}` : ""}
                        });
                    };
                    
                    export default ${fileName};
                    `,
        };
      } else if (api.useMutation) {
        const { invalidateKey, invalidateApiName } = api.useMutation;
        let queryKey = null;
        if (invalidateApiName) {
          queryKey = `['${invalidateApiName}']`;
        } else if (invalidateKey) {
          queryKey = invalidateKey;
        }

        res = {
          name: fileName,
          content: `
                    import { useMutation, ${queryKey ? "useQueryClient" : ""} } from '@tanstack/react-query';
                    import { ${typeInfo.paramTypeName}, ${instanceName} } from '../../${this.className}';
                    
                    const ${fileName} = () => {
                        ${queryKey ? "const queryClient = useQueryClient()" : ""}
                        return useMutation({
                            mutationFn: (params: ${typeInfo.paramTypeName}) => ${instanceName}.${api.name}(params),
                            ${
                              queryKey
                                ? `onSettled: () => {
                              queryClient.invalidateQueries({ queryKey: ${queryKey} })
                            }`
                                : ""
                            }
                        });
                    };
                    
                    export default ${fileName};
                    `,
        };
      }
      queries.push(res);
    }
    return queries;
  }

  /** build one file */
  async buildService(
    path: string,
    ignorePaths: string[],
    prettierOptions: prettier.Options,
  ) {
    // check ignore
    const serviceIgnore = ignorePaths.some((ignorePath) =>
      path.includes(ignorePath),
    );
    if (serviceIgnore) return;

    const formatted = await prettier.format(this.getCode(), prettierOptions);
    fs.writeFileSync(path, formatted, { encoding: "utf-8" });
  }

  /** build multiple files */
  async buildQueryHooks(
    queryRootPath: string,
    ignorePaths: string[],
    prettierOptions: prettier.Options,
  ) {
    const queryFiles = this.generateQueryFiles();
    for (const { name, content } of queryFiles) {
      const filePath = resolve(queryRootPath, `${name}.ts`);

      // check ignore
      const isHookIgnore = ignorePaths.some((ignorePath) =>
        filePath.includes(ignorePath),
      );
      if (isHookIgnore) continue;

      const formatted = await prettier.format(content, prettierOptions);
      fs.writeFileSync(filePath, formatted, { encoding: "utf-8" });
    }
  }

  private generateHeader(key: string, value: string) {
    const parseValue = parseBracket(value);
    if (!parseValue.isBracket) {
      return `config.headers['${key}'] = "${value}"`;
    }

    // append custom tag syntax (<customTag>value</customTag>)
    switch (parseValue.key) {
      case "cookie":
        return `config.headers['${key}'] = \`${value.replace(parseValue.matchStr, `$\{HttpClient.getFromCookie("${parseValue.value}")}`)}\``;
      default:
        throw new Error(`지원하지 않는 태그 입니다 ${parseValue.key}`);
    }
  }

  #generateApiType(api: ApiSpec) {
    if (this.typeCache[api.name]) {
      return this.typeCache[api.name];
    }

    const paramExist = api.params != null;
    let paramTypeName = "";
    let paramType = "";
    if (paramExist) {
      paramTypeName = `T${toPascalCase(api.name)}Params`;
      paramType = this.#toType(api.params, { name: paramTypeName });
    }

    const responseExist = api.response != null;
    let responseTypeName = "";
    let responseType = "";
    if (responseExist) {
      responseTypeName = `T${toPascalCase(api.name)}Response`;
      responseType = this.#toType(api.response, { name: responseTypeName });
    }

    const bodyExist = api.body != null;
    let bodyType = "";
    let bodyTypeName = "";
    if (bodyExist) {
      bodyTypeName = `T${toPascalCase(api.name)}Body`;
      bodyType = this.#toType(api.body, { name: bodyTypeName });
    }

    const result: ApiType = {
      paramTypeName,
      paramType,
      responseTypeName,
      responseType,
      bodyTypeName,
      bodyType,
      bodyExist,
      paramExist,
      responseExist,
      fullStr: `
             ${paramExist ? paramType : ""};
             ${responseExist ? responseType : ""};
             ${bodyExist ? bodyType : ""};`,
    };

    this.typeCache[api.name] = result;

    return result;
  }

  #toType(obj: Record<string, any> | undefined, { name }: { name: string }) {
    // 1. primitive type or <raw> tag;
    if (obj && typeof obj !== "object") {
      const bracketParse = parseBracket(obj);
      return `export type ${name} = ${bracketParse.value || typeof obj};`;
    }

    // 2. init variable
    let _obj = JSON.parse(JSON.stringify(obj));
    const isArray = Array.isArray(_obj);
    let marking = [];

    const markingBracket = (
      obj: Record<string, any>,
      marking: { targetKey: string; value: string; originKey: string }[],
    ) => {
      // 1. recursive find every bracket syntax in object and mark it
      Object.keys(obj).forEach((key, i) => {
        const v = obj[key];
        if (typeof v === "object") {
          return markingBracket(v, marking);
        } else {
          const parseValue = parseBracket(v);
          if (parseValue.isBracket) {
            const randomSuffix = Math.random().toString(36).substring(7);
            const tempKey = `${key}_${randomSuffix}`;
            marking.push({
              targetKey: tempKey,
              value: parseValue.value!,
              originKey: key,
            });
            delete obj[key];
            obj[tempKey] = `string`;
          }
        }
      });
      return marking;
    };
    const resolveMarking = (
      pureString: string,
      marking: { targetKey: string; value: string; originKey: string }[],
    ) => {
      // 1. if no marking, return pureString
      let result = pureString;
      if (!marking.length) return result;
      marking.forEach(({ targetKey, value, originKey }) => {
        // 2. if value include undefined,remove undefined & make key as optional
        /**
         * undefined
         * undefined | A
         * A | undefined
         * A | undefined | B
         */
        const undefinedRex = /\|?\s?undefined\s?\|?/g;
        const regRes = value.match(undefinedRex);
        if (regRes) {
          value = value.replace(
            undefinedRex,
            regRes[0] === "|undefined|" ? "|" : "",
          );
          originKey = `${originKey}?`;
        }
        // 3. replace marked key's value to raw string value
        const regExp = new RegExp(`${targetKey}:\\s?string`, "g");
        result = result.replace(regExp, `${originKey}:${value}`);
      });
      return result;
    };

    // 3. check bracket syntax
    marking = markingBracket(_obj, []);

    // 4. if Root type is Array
    if (isArray) {
      // 4-1. primitive array
      const isPrimitive = _obj.every(
        (item) => typeof item !== "object" && item.targetKey === item.originKey,
      );
      const typeArr = _obj
        .map((item) => typeof item)
        .filter((item, i, arr) => arr.indexOf(item) === i)
        .join("|");
      if (isPrimitive) {
        return `export type ${name} = (${typeArr})[];`;
      }

      // 4-2. object array
      const temp = {
        [name]: _obj,
      };
      const typeExceptContainer = jsonToTs(temp, { useTypeAlias: true }).slice(
        1,
      );
      let result = typeExceptContainer
        .map((typeAlias, i) => `export ${typeAlias}${i === 0 ? "[]" : ""}`)
        .join("\n");
      result = resolveMarking(result, marking);
      return result;
    }

    // 5. normal object type
    let result = jsonToTs(_obj, { useTypeAlias: true, rootName: name })
      .map((typeInterface) => `export ${typeInterface}`)
      .join("\n");
    result = resolveMarking(result, marking);
    return result;
  }

  #generateRequest(api: ApiSpec) {
    const {
      paramTypeName,
      responseTypeName,
      bodyTypeName,
      bodyExist,
      paramExist,
      responseExist,
    } = this.#generateApiType(api);
    const method = api.method.toLowerCase();
    const hasBodyMethod = method !== "get" && method !== "delete";

    const paramString = paramExist ? `params:${paramTypeName}` : "";
    const bodyString = bodyExist ? `body:${bodyTypeName}` : "";
    const argsString = [paramString, bodyString]
      .filter((str) => str !== "")
      .join(",");

    const httpBodyString = hasBodyMethod
      ? `${bodyExist ? "body" : "null"}`
      : "";
    const httpParamString = paramExist ? "params" : "";
    const httpArgsString = [httpBodyString, httpParamString]
      .filter((str) => str != "")
      .join(",");

    return `async ${api.name}(${argsString}) { return this.httpClient.${method}<${responseTypeName || "any"}>('${api.path}'${httpArgsString.length > 0 ? `,${httpArgsString}` : ""}); }`;
  }
}
