// api.config.ts

import { ApiConfig } from "./src/typings";

const config: ApiConfig = {
  path: "result/api", // output directory
  ignorePattern: ["**/useCustomApiHook.ts"], // glob pattern for ignore files
  services: {
    serviceA: {
      baseURL: "<raw>import.meta.env.MY_API_URL</raw>",
      headers: {
        Authorization: "Bearer <cookie>key from cookie</cookie>",
        "x-custom-header1": "<localStorage>userId</localStorage>",
        "x-custom-header2": "<sessionStorage>token</sessionStorage>",
      },
      apis: [
        // endpoints
        {
          name: "getTodos",
          method: "GET",
          path: "/todos",
          params: {
            page: 0,
          },
          response: {
            nextPage: 0,
            todos: [
              {
                id: 0,
                title: "",
                description: "",
                isCompleted: true,
              },
            ],
          },
          useInfiniteQuery: {
            pageKey: "page",
            initialPageParam: 1,
            getNextPageParam: "(lastPage)=> lastPage.nextPage",
          },
        },
      ],
    },
    serviceB: {
      baseURL: "https://api.serviceB.com",
      apis: [
        // endpoints
        {
          name: "getTodos",
          method: "POST",
          path: "/todo/{id}",
          params: {
            id: 0,
          },
          body: {
            title: `<raw>string|undefined</raw>`,
            description: `<raw>string|undefined</raw>`,
            isCompleted: `<raw>boolean|undefined</raw>`,
          },
          response: {
            id: 0,
            title: "",
            description: "",
            isCompleted: true,
          },
          useMutation: true,
        },
      ],
    },
  },
};

export default config;
