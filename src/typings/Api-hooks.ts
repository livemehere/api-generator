export interface CommonQueryHookOption {
  defaultScript?: string;
  enabled?: string;

  // exclude on mutation
  strictParams?: boolean;
  queryKey?: string;
  queryFn?: string;
}

export type UseQueryOption = boolean | CommonQueryHookOption;
export type UseMutationOption =
  | boolean
  | ({
      invalidateQueryKey?: string;
      mutationFn?: string;
    } & Omit<CommonQueryHookOption, "queryFn" | "queryKey" | "strictParams">);
export type UseInfiniteQueryOption = {
  pageKey: string;
  queryKey?: string;
  initialPageParam: any;
  getNextPageParam: string;
  getPreviousPageParam?: string;
} & CommonQueryHookOption;
