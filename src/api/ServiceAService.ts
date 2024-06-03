import HttpClient from "./HttpClient";

export type TGetTodosParams = {
  page: number;
};
export type TGetTodosResponse = {
  nextPage: number;
  todos: Todo[];
};
export type Todo = {
  id: number;
  title: string;
  description: string;
  isCompleted: boolean;
};
class ServiceAService {
  private httpClient: HttpClient = new HttpClient({
    baseURL: "https://api.serviceA.com",
    requestHook: (config) => {
      config.headers["Authorization"] =
        `Bearer ${HttpClient.getFromCookie("key from cookie")}`;
      return config;
    },
  });

  async getTodos(params: TGetTodosParams) {
    return this.httpClient.get<TGetTodosResponse>(`/todos`, params);
  }
}
export const serviceAService = new ServiceAService();
