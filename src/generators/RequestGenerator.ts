import { ApiSpec, ApiType } from "../type";
import { parseBlocks, parseBracket, toPascalCase } from "../utils";
import jsonToTs from "json-to-ts";
import { Generator } from "./Generator";

export class RequestGenerator implements Generator {
  api: ApiSpec;
  serviceClassName: string;
  serviceInstanceName: string;
  types!: ApiType;
  private method!: string;
  constructor(
    api: ApiSpec,
    serviceClassName: string,
    serviceInstanceName: string,
  ) {
    this.api = api;
    this.serviceClassName = serviceClassName;
    this.serviceInstanceName = serviceInstanceName;
    this.generateTypes();
    this.generateMethod();
  }

  getCode() {
    return this.method;
  }

  private generateMethod() {
    const {
      paramTypeName,
      responseTypeName,
      bodyTypeName,
      bodyExist,
      paramExist,
      responseExist,
    } = this.types;
    const method = this.api.method.toLowerCase();
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
    let httpArgsString = [httpParamString, httpBodyString]
      .filter((str) => str != "")
      .join(",");

    if (!paramExist && bodyExist) {
      httpArgsString = `undefined,body`;
    }

    const pathParams = parseBlocks(this.api.path);
    if (pathParams.length > 0) {
      let parsedPath = this.api.path;
      const pathParamKeys = pathParams.map((p) => p.key);
      const filteredParamKeys = Object.keys(this.api.params!).filter(
        (key) => !pathParamKeys.includes(key),
      );
      const hasRestParam = filteredParamKeys.length > 0;

      pathParams.forEach((param) => {
        const { key, matchStr } = param;
        parsedPath = parsedPath.replace(matchStr, `\${params.${key}}`);
      });

      let _httpArgsString = `,${httpArgsString.replace("params", hasRestParam ? "_params" : "undefined")}`;
      if (_httpArgsString === ",undefined") {
        _httpArgsString = "";
      }

      this.method = `async ${this.api.name}(${argsString}) { 
        ${
          hasRestParam
            ? `const _params = {
            ${filteredParamKeys.map((key) => `${key}: params.${key}`).join(",\n")}
        }`
            : ""
        }
        return this.httpClient.${method}<${responseTypeName || "any"}${bodyExist ? `,${bodyTypeName}` : ""}>(\`${parsedPath}\`${httpArgsString.length > 0 ? _httpArgsString : ""}); 
      }`;
    } else {
      this.method = `async ${this.api.name}(${argsString}) { 
        return this.httpClient.${method}<${responseTypeName || "any"}${bodyExist ? `,${bodyTypeName}` : ""}>(\`${this.api.path}\`${httpArgsString.length > 0 ? `,${httpArgsString}` : ""}); 
    }`;
    }
  }

  private generateTypes() {
    const paramExist = this.api.params != null;
    let paramTypeName = "";
    let paramType = "";
    if (paramExist) {
      paramTypeName = `T${toPascalCase(this.api.name)}Params`;
      paramType = this.toType(this.api.params, { name: paramTypeName });
    }

    const responseExist = this.api.response != null;
    let responseTypeName = "";
    let responseType = "";
    if (responseExist) {
      responseTypeName = `T${toPascalCase(this.api.name)}Response`;
      responseType = this.toType(this.api.response, { name: responseTypeName });
    }

    const bodyExist = this.api.body != null;
    let bodyType = "";
    let bodyTypeName = "";
    if (bodyExist) {
      bodyTypeName = `T${toPascalCase(this.api.name)}Body`;
      bodyType = this.toType(this.api.body, { name: bodyTypeName });
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

    this.types = result;
  }

  private toType(
    obj: Record<string, any> | undefined,
    { name }: { name: string },
  ) {
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
}
