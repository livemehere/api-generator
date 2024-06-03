import { useQuery } from "@tanstack/react-query";
import { serviceAService } from "../../ServiceAService";

const useGetTodos = () => {
  return useQuery({
    queryKey: ["getTodos", "customKey"],
    queryFn: () => serviceAService.getTodos().then((res) => res[0]),
    enabled: !!window,
  });
};
export default useGetTodos;
