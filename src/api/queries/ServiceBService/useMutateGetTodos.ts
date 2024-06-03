import { useMutation } from "@tanstack/react-query";
import {
  TGetTodosParams,
  TGetTodosBody,
  serviceBService,
} from "../../ServiceBService";

const useMutateGetTodos = () => {
  return useMutation({
    mutationFn: ({
      params,
      body,
    }: {
      params: TGetTodosParams;
      body: TGetTodosBody;
    }) => serviceBService.getTodos(params, body),
  });
};
export default useMutateGetTodos;
