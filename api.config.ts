import { ApiConfig } from "./src/type";

const config: ApiConfig = {
  path: "result/api",
  ignorePattern: ["**/HttpClient.ts", "**/useMutateUpdateCardEmoji.ts"],
  services: {
    json: {
      baseURL: "http://localhost:4000",
      apis: [
        /* Case1. GET (no Params) */
        {
          name: "getTodos",
          method: "get",
          path: "/todos",
          response: [
            {
              id: 0,
              title: "",
              completed: false,
            },
          ],
          useQuery: true,
        },
        /* Case2. GET with params & pathParams */
        {
          name: "getTodo",
          method: "get",
          path: "/todos/{id}",
          response: {
            id: 0,
            title: "",
            completed: false,
          },
          params: {
            id: 0,
          },
          useQuery: true,
        },
        /* Case3. POST with body & (no pathParams & no params) */
        {
          name: "postTodo",
          method: "post",
          path: "/todos",
          response: {
            res: "",
          },
          body: {
            id: 0,
            title: "",
            completed: false,
          },
          useMutation: {
            invalidateQueryKey: "['getTodos']",
          },
        },
        /* Case4. POST with body pathParams (no params) */
        {
          name: "postTodo2",
          method: "post",
          path: "/todos/{id}",
          params: {
            id: 0,
          },
          response: {
            res: "",
          },
          body: {
            id: 0,
            title: "",
            completed: false,
          },
          useMutation: {
            invalidateQueryKey: "['getTodos']",
          },
        },
        /* Case5. PUT with body & pathParams & params */
        {
          name: "putTodo",
          method: "put",
          path: "/todos/{id}",
          params: {
            id: 0,
          },
          response: {
            id: 0,
            title: "",
            completed: false,
          },
          body: {
            id: `<raw>number|undefined</raw>`,
            title: `<raw>string|undefined</raw>`,
            completed: `<raw>boolean|undefined</raw>`,
          },
          useMutation: {
            invalidateQueryKey: "['getTodos']",
          },
        },
        /* Case6. DELETE with pathParams & (no params) */
        {
          name: "deleteTodo",
          method: "delete",
          path: "/todos/{id}",
          params: {
            id: 0,
          },
          response: {},
          useMutation: {
            invalidateQueryKey: "['getTodos']",
          },
        },
        /* Case7. DELETE with params & pathParams */
        {
          name: "deleteTodo2",
          method: "delete",
          path: "/todos/{id}",
          response: {
            res: "",
          },
          params: {
            id: 0,
            name: "",
            age: 0,
          },
          useMutation: {
            invalidateQueryKey: "['getTodos', 'getTodo']",
          },
        },
      ],
    },
  },
};

export default config;
