import { Generator } from "./Generator";
import { ApiSpec, ApiType } from "../typings";
import { RequestGenerator } from "./RequestGenerator";
import { joinValidString, toPascalCase } from "../utils";
import { CommonQueryHookOption, UseMutationOption } from "../typings/Api-hooks";

export class TanstackQueryGenerator implements Generator {
  filename: string;
  private rg: RequestGenerator;
  private api: ApiSpec;
  private types: ApiType;

  private serviceInstanceName: string;
  private serviceClassName: string;

  constructor(rg: RequestGenerator) {
    this.rg = rg;
    this.serviceInstanceName = this.rg.serviceInstanceName;
    this.serviceClassName = this.rg.serviceClassName;
    this.api = this.rg.api;
    this.types = this.rg.types;

    this.filename = this.generateFileName();
  }

  getCode() {
    if (this.api.useInfiniteQuery) return this.getUseInfiniteQueryCode();
    if (this.api.useMutation) return this.getUseMutateCode();
    return this.getUseQueryCode();
  }

  private generateFileName() {
    const baseName = toPascalCase(this.api.name);
    if (this.api.useMutation) return `useMutate${baseName}`;
    if (this.api.useInfiniteQuery) return `useInfinite${baseName}`;
    return `use${baseName}`;
  }

  private getCommonOptions(): CommonQueryHookOption | null {
    if (typeof this.api.useQuery === "object") {
      return this.api.useQuery;
    }
    if (this.api.useInfiniteQuery) {
      return {
        defaultScript: this.api.useInfiniteQuery.defaultScript,
        strictParams: this.api.useInfiniteQuery.strictParams,
        queryKey: this.api.useInfiniteQuery.queryKey,
        queryFn: this.api.useInfiniteQuery.queryFn,
        enabled: this.api.useInfiniteQuery.enabled,
      };
    }
    if (this.api.useMutation && typeof this.api.useMutation === "object") {
      return {
        defaultScript: this.api.useMutation.defaultScript,
        enabled: this.api.useMutation.enabled,
      };
    }
    return null;
  }

  private getMutationOptions(): UseMutationOption | null {
    if (this.api.useMutation && typeof this.api.useMutation !== "boolean") {
      return this.api.useMutation;
    }
    return null;
  }

  private getDefaultScriptStr() {
    return this.getCommonOptions()?.defaultScript || "";
  }

  private getParamTypeStr() {
    const commonOption = this.getCommonOptions();
    const { paramTypeName } = this.types;
    return commonOption?.strictParams
      ? paramTypeName
      : `Partial<${paramTypeName}>`;
  }

  /** When use body as useQuery parameters */
  private getParamFromBodyTypeStr() {
    const commonOption = this.getCommonOptions();
    const { bodyTypeName } = this.types;
    return commonOption?.strictParams
      ? bodyTypeName
      : `Partial<${bodyTypeName}>`;
  }

  private getImportStr() {
    const { paramTypeName, bodyTypeName } = this.types;
    if (this.api.useQuery) {
      return `
       import { useQuery } from '@tanstack/react-query';
       import { ${joinValidString([paramTypeName, bodyTypeName, this.serviceInstanceName])} } from '../../${this.serviceClassName}';
     `;
    }

    if (this.api.useInfiniteQuery) {
      return `
         import { useInfiniteQuery } from '@tanstack/react-query';
         import { ${joinValidString([paramTypeName, this.serviceInstanceName])} } from '../../${this.serviceClassName}';
      `;
    }

    if (this.api.useMutation) {
      const mutationOption = this.getMutationOptions();
      const hasInvalidateQueryKey =
        typeof mutationOption !== "boolean" &&
        mutationOption?.invalidateQueryKey;

      return `
         import { useMutation, ${hasInvalidateQueryKey ? "useQueryClient" : ""} } from '@tanstack/react-query';
         import { ${joinValidString([paramTypeName, bodyTypeName, this.serviceInstanceName])} } from '../../${this.serviceClassName}';
      `;
    }
  }

  private getQueryKeyStr() {
    const commonOption = this.getCommonOptions();
    if (commonOption?.queryKey) {
      return commonOption.queryKey;
    }

    if (this.api.useQuery) {
      return `['${this.api.name}'${this.types.paramExist ? `,JSON.stringify(params)` : ""} ${this.types.bodyExist ? ",JSON.stringify(body)" : ""}]`;
    }
    if (this.api.useInfiniteQuery) {
      const { paramTypeName } = this.types;
      const { pageKey } = this.api.useInfiniteQuery;
      const paramWithoutPageKey = `Object.keys(params).reduce((acc, key) => key !== '${this.api.useInfiniteQuery.pageKey}' ? {...acc, [key]: params[key as keyof Omit<${paramTypeName}, "${pageKey}">]} : acc, {})`;
      return `['${this.api.name}',${this.types.paramExist ? `JSON.stringify(${paramWithoutPageKey})` : ""}]`;
    }
  }

  private getQueryFnStr() {
    const commonOption = this.getCommonOptions();
    const { paramTypeName, paramType, paramExist, bodyExist, bodyTypeName } =
      this.types;
    if (commonOption?.queryFn) {
      return commonOption.queryFn;
    }

    if (this.api.useQuery) {
      return `() => ${this.serviceInstanceName}.${this.api.name}(${paramExist ? `params as NonNullable<${paramTypeName}>` : ""} ${bodyExist ? `${paramExist ? "," : ""}body as NonNullable<${bodyTypeName}>` : ""})`;
    }

    if (this.api.useInfiniteQuery) {
      const { pageKey } = this.api.useInfiniteQuery;
      return `({pageParam}) => ${this.serviceInstanceName}.${this.api.name}({...(params as NonNullable<${paramTypeName}>),${pageKey}:pageParam})`;
    }

    if (this.api.useMutation) {
      const paramStr = paramExist ? `params:${paramTypeName}` : "";
      const bodyStr = bodyExist ? `body:${bodyTypeName}` : "";
      const argsStr = joinValidString([paramStr, bodyStr]);
      const httpParamStr = paramExist ? "params" : "";
      const httpBodyStr = bodyExist ? "body" : "";
      const httpArgsStr = joinValidString([httpParamStr, httpBodyStr]);

      return `(${httpArgsStr ? `{${httpArgsStr}} : {${argsStr}}` : ""}) => ${this.serviceInstanceName}.${this.api.name}(${httpArgsStr})`;
    }
  }

  private getEnableStr() {
    const commonOption = this.getCommonOptions();
    const { paramTypeName, paramExist, bodyExist, bodyTypeName } = this.types;

    if (commonOption?.enabled) {
      return `enabled: ${commonOption.enabled}`;
    }

    if (!paramExist && !bodyExist) return "";

    if (this.api.useQuery) {
      if (paramExist && !bodyExist) {
        return `enabled: Object.keys(params).every((key) => params[key as keyof ${paramTypeName}] != null )`;
      }
      if (!paramExist && bodyExist) {
        return `enabled: Object.keys(body).every((key) => body[key as keyof ${bodyTypeName}] != null )`;
      }
      return `enabled: Object.keys(params).every((key) => params[key as keyof ${paramTypeName}] != null ) && Object.keys(body).every((key) => body[key as keyof ${bodyTypeName}] != null )`;
    }

    if (this.api.useInfiniteQuery) {
      const { pageKey } = this.api.useInfiniteQuery;
      return `enabled: Object.keys(params).every((key) => params[key as keyof Omit<${paramTypeName}, '${pageKey}'>] != null ),`;
    }

    return "";
  }

  private getUseQueryCode() {
    const { paramExist, bodyExist } = this.types;
    return `
      ${this.getImportStr()}
      ${this.getDefaultScriptStr()}
      
      const ${this.filename} = (${paramExist ? `params: ${this.getParamTypeStr()}` : ""} ${bodyExist ? `${paramExist ? "," : ""} body: ${this.getParamFromBodyTypeStr()}` : ""}) => {
          return useQuery({
              queryKey: ${this.getQueryKeyStr()},
              queryFn: ${this.getQueryFnStr()},
              ${this.getEnableStr()}
          });
      };
      export default ${this.filename};
    `;
  }

  private getUseMutateCode() {
    const mutationOption = this.getMutationOptions();
    const invalidateQueryKey =
      typeof mutationOption !== "boolean" && mutationOption?.invalidateQueryKey;
    return `
        ${this.getImportStr()}
        ${this.getDefaultScriptStr()}
        
        const ${this.filename} = () => {
            ${invalidateQueryKey ? "const queryClient = useQueryClient()" : ""}
            return useMutation({
                mutationFn: ${this.getQueryFnStr()}
                ${invalidateQueryKey ? `,onSettled: () => { queryClient.invalidateQueries({ queryKey: ${invalidateQueryKey} }) }` : ""}
            });
        };
        export default ${this.filename};
    `;
  }

  private getUseInfiniteQueryCode() {
    const {
      initialPageParam,
      pageKey,
      getNextPageParam,
      getPreviousPageParam,
    } = this.api.useInfiniteQuery!;
    const { paramExist } = this.types;

    return `
      ${this.getImportStr()}
      ${this.getDefaultScriptStr()}
      
      const ${this.filename} = (initialPageParam = ${initialPageParam}${paramExist ? `, params: Omit<${this.getParamTypeStr()}, '${pageKey}'>` : ""}) => {
          return useInfiniteQuery({
              queryKey: ${this.getQueryKeyStr()},
              queryFn: ${this.getQueryFnStr()},
              initialPageParam: initialPageParam,
              ${this.getEnableStr()}
              ${getNextPageParam ? `getNextPageParam:${getNextPageParam}` : ""},
              ${getPreviousPageParam ? `getPreviousPageParam:${getPreviousPageParam}` : ""}
          });
      };

      export default ${this.filename};
    `;
  }
}
