import { useInfiniteQuery } from "@tanstack/react-query";
import { TGetTodosParams, serviceAService } from "../../ServiceAService";

const useInfiniteGetTodos = (
  initialPageParam = 1,
  params: Omit<Partial<TGetTodosParams>, "page">,
) => {
  return useInfiniteQuery({
    queryKey: [
      "getTodos",
      JSON.stringify(
        Object.keys(params).reduce(
          (acc, key) =>
            key !== "page"
              ? {
                  ...acc,
                  [key]: params[key as keyof Omit<TGetTodosParams, "page">],
                }
              : acc,
          {},
        ),
      ),
    ],
    queryFn: ({ pageParam }) =>
      serviceAService.getTodos({
        ...(params as NonNullable<TGetTodosParams>),
        page: pageParam,
      }),
    initialPageParam: initialPageParam,
    enabled: Object.keys(params).every(
      (key) => params[key as keyof Omit<TGetTodosParams, "page">] != null,
    ),
    getNextPageParam: (lastPage) => lastPage.nextPage,
  });
};

export default useInfiniteGetTodos;
