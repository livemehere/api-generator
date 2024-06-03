import {
  UseInfiniteQueryOption,
  UseMutationOption,
  UseQueryOption,
} from "./typings/Api-hooks";

export interface ApiConfig {
  path: string;
  ignorePattern?: string[];
  services: {
    [key: string]: ServiceOption;
  };
}

export interface ServiceOption {
  baseURL: string;
  headers?: HeaderSpec;
  apis: ApiSpec[];
  defaultScript?: string;
}

export interface HeaderSpec {
  [key: string]: string;
}

export interface ApiSpec {
  method: string;
  name: string;
  path: string;
  response?: any;
  params?: Record<string, any>;
  body?: Record<string, any>;
  initialCallEvenParamsFalsy?: boolean; // default, useQuery initialCall when param's properties are all filled
  useQuery?: UseQueryOption;
  useMutation?: UseMutationOption;
  useInfiniteQuery?: UseInfiniteQueryOption;
}

export interface ApiType {
  paramTypeName: string;
  paramType: string;
  responseTypeName: string;
  responseType: string;
  bodyTypeName: string;
  bodyType: string;
  bodyExist: boolean;
  paramExist: boolean;
  responseExist: boolean;
  fullStr: string;
}
