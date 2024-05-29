export interface ApiConfig {
  path: string;
  ignorePattern?: string[];
  services: {
    [key: string]: ServiceOption;
  };
}

export interface ServiceOption {
  baseURL: string;
  headers: HeaderSpec;
  apis: ApiSpec[];
  defaultTopScript?: string;
}

export interface HeaderSpec {
  Authorization: string;
  [key: string]: string;
}

export interface ApiSpec {
  method: string;
  name: string;
  path: string;
  response?: any;
  params?: Record<string, any>;
  body?: Record<string, any>;
  useQuery?: boolean;
  useQueryStrictParams?: boolean;
  useMutation?: {
    invalidateKey?: string;
    invalidateApiName?: string;
  };
  useInfiniteQuery?: {
    pageKey: string;
    queryKey?: string;
    initialPageParam: any;
    getNextPageParam: string;
    getPreviousPageParam?: string;
    defaultTopScript?: string;
  };
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
