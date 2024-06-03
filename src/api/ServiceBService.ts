import HttpClient from "./HttpClient";

export type TGetTodosParams = {
  id: number;
};
export type TGetTodosResponse = {
  id: number;
  title: string;
  description: string;
  isCompleted: boolean;
};
export type TGetTodosBody = {
  title?: string;
  description?: string;
  isCompleted?: boolean;
};

class ServiceBService {
  private httpClient: HttpClient = new HttpClient({
    baseURL: "https://api.serviceB.com",
    requestHook: (config) => {
      return config;
    },
  });

  async getTodos(params: TGetTodosParams, body: TGetTodosBody) {
    return this.httpClient.post<TGetTodosResponse, TGetTodosBody>(
      `/todo/${params.id}`,
      undefined,
      body,
    );
  }
}
export const serviceBService = new ServiceBService();
